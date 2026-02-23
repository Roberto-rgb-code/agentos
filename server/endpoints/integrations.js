const { reqBody } = require("../utils/http");
const { validatedRequest } = require("../utils/middleware/validatedRequest");
const { validateIntegrationKey } = require("../utils/middleware/validateIntegrationKey");
const { WhatsappMessage } = require("../models/whatsappMessage");

function integrationsEndpoints(app) {
  if (!app) return;

  // POST /api/integrations/whatsapp/inbound - Receive WhatsApp webhook from n8n
  // Requires X-Integration-Key header with a valid premium integration API key
  app.post(
    "/integrations/whatsapp/inbound",
    [validatedRequest, validateIntegrationKey()],
    async (request, response) => {
      try {
        // Get user from validated API key (set by middleware)
        const user = response.locals.integrationUser;
        if (!user) {
          const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
          if (isDev) {
            console.log("[integrations/whatsapp/inbound] Rejected: No user from validated API key");
          }
          return response.status(401).json({
            error: "invalid_integration_key",
          });
        }

        // Verify user has premium plan
        if (user.plan !== "premium") {
          const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
          if (isDev) {
            console.log(`[integrations/whatsapp/inbound] Rejected: User ${user.id} has plan '${user.plan}', requires 'premium'`);
          }
          return response.status(403).json({
            error: "plan_required",
            required: "premium",
          });
        }

        const body = reqBody(request);
        const { from, messageId, text, timestamp, raw } = body;

        if (!from || !messageId) {
          return response
            .status(400)
            .json({ error: "from and messageId are required" });
        }

        // Auto-create lead if it doesn't exist
        const result = await WhatsappMessage.create({
          from,
          messageId,
          text: text || "",
          timestamp,
          raw,
          userId: user.id,
          autoCreateLead: true,
        });

        if (result.error) {
          return response.status(400).json({ error: result.error });
        }

        response.status(201).json({
          message: result.message,
          lead: result.lead,
          created: !!result.lead,
        });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );
}

module.exports = { integrationsEndpoints };

