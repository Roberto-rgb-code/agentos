const { reqBody, userFromSession } = require("../utils/http");
const { validatedRequest } = require("../utils/middleware/validatedRequest");
const {
  strictMultiUserRoleValid,
  ROLES,
} = require("../utils/middleware/multiUserProtected");
const { Lead, LeadStatus, EtapaPipeline } = require("../models/lead");
const { LeadEvent, LeadEventType } = require("../models/leadEvent");
const { Conversacion } = require("../models/conversacion");
const { Agente } = require("../models/agente");
const { Producto } = require("../models/producto");
const { CrmWebhook } = require("../models/crmWebhook");
const { WhatsappMessage } = require("../models/whatsappMessage");

function crmEndpoints(app) {
  if (!app) return;

  // ============================================
  // LEADS
  // ============================================

  // GET /api/crm/leads - List all leads
  app.get(
    "/crm/leads",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) return response.sendStatus(401).end();

        const { status, etapa, search, ciudad, limit, skip } = request.query;
        const leads = await Lead.where(user.id, {
          status,
          etapa,
          search,
          ciudad,
          limit: limit ? parseInt(limit) : undefined,
          skip: skip ? parseInt(skip) : undefined,
        });

        response.status(200).json({ leads });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // POST /api/crm/leads - Create a new lead
  app.post(
    "/crm/leads",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) return response.sendStatus(401).end();

        const body = reqBody(request);
        const { name, phone, email, source, status, ciudad, interes, etapa, agente_id } = body;

        if (!name) {
          return response.status(400).json({ error: "Name is required" });
        }

        const result = await Lead.create({
          userId: user.id,
          name,
          phone,
          email,
          source,
          status,
          ciudad,
          interes,
          etapa,
          agente_id,
        });

        if (result.error) {
          return response.status(400).json({ error: result.error });
        }

        response.status(201).json({ lead: result.lead });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // GET /api/crm/leads/:id - Get a single lead
  app.get(
    "/crm/leads/:id",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) return response.sendStatus(401).end();

        const { id } = request.params;
        const lead = await Lead.get({ id, userId: user.id });

        if (!lead) return response.sendStatus(404).end();

        response.status(200).json({ lead });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // PATCH /api/crm/leads/:id - Update a lead
  app.patch(
    "/crm/leads/:id",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) return response.sendStatus(401).end();

        const { id } = request.params;
        const body = reqBody(request);

        const result = await Lead.update({
          id,
          userId: user.id,
          updates: body,
        });

        if (result.error) {
          return response.status(400).json({ error: result.error });
        }

        response.status(200).json({ lead: result.lead });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // GET /api/crm/pipeline - Pipeline stats
  app.get(
    "/crm/pipeline",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) return response.sendStatus(401).end();

        const stats = await Lead.pipelineStats(user.id);
        response.status(200).json({ pipeline: stats });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // LEAD EVENTS
  // ============================================

  // POST /api/crm/leads/:id/events
  app.post(
    "/crm/leads/:id/events",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) return response.sendStatus(401).end();

        const { id } = request.params;
        const lead = await Lead.get({ id, userId: user.id });
        if (!lead) return response.sendStatus(404).end();

        const body = reqBody(request);
        const { type, revenue, meta } = body;

        const result = await LeadEvent.create({
          leadId: id,
          type,
          revenue,
          meta,
        });

        if (result.error) {
          return response.status(400).json({ error: result.error });
        }

        response.status(201).json({ event: result.event });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // GET /api/crm/leads/:id/events
  app.get(
    "/crm/leads/:id/events",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) return response.sendStatus(401).end();

        const { id } = request.params;
        const lead = await Lead.get({ id, userId: user.id });
        if (!lead) return response.sendStatus(404).end();

        const events = await LeadEvent.forLead(id);
        response.status(200).json({ events });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // CONVERSACIONES
  // ============================================

  // GET /api/crm/leads/:id/conversaciones
  app.get(
    "/crm/leads/:id/conversaciones",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) return response.sendStatus(401).end();

        const { id } = request.params;
        const lead = await Lead.get({ id, userId: user.id });
        if (!lead) return response.sendStatus(404).end();

        const conversaciones = await Conversacion.forLead(id);
        response.status(200).json({ conversaciones });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // POST /api/crm/leads/:id/conversaciones
  app.post(
    "/crm/leads/:id/conversaciones",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) return response.sendStatus(401).end();

        const { id } = request.params;
        const lead = await Lead.get({ id, userId: user.id });
        if (!lead) return response.sendStatus(404).end();

        const body = reqBody(request);
        const { mensaje, rol } = body;

        if (!mensaje) {
          return response.status(400).json({ error: "mensaje is required" });
        }

        const result = await Conversacion.create({
          leadId: id,
          mensaje,
          rol: rol || "user",
        });

        if (result.error) {
          return response.status(400).json({ error: result.error });
        }

        response.status(201).json({ conversacion: result.conversacion });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // WHATSAPP MESSAGES
  // ============================================

  // GET /api/crm/leads/:id/whatsapp-messages
  app.get(
    "/crm/leads/:id/whatsapp-messages",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) return response.sendStatus(401).end();

        const { id } = request.params;
        const lead = await Lead.get({ id, userId: user.id });
        if (!lead) return response.sendStatus(404).end();

        const messages = await WhatsappMessage.forLead(id);
        response.status(200).json({ messages });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // POST /api/crm/whatsapp/send - Send WhatsApp message via Meta API
  app.post(
    "/crm/whatsapp/send",
    async (request, response) => {
      try {
        const body = reqBody(request);
        const { to, message } = body;

        if (!to || !message) {
          return response.status(400).json({ error: "to and message are required" });
        }

        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

        if (!phoneNumberId || !accessToken) {
          return response.status(500).json({ 
            error: "WhatsApp credentials not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN" 
          });
        }

        // Send message via Meta WhatsApp Business API
        const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
        const payload = {
          messaging_product: "whatsapp",
          to: to,
          type: "text",
          text: {
            body: message
          }
        };

        const fetch = require("node-fetch");
        const apiResponse = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const result = await apiResponse.json();

        if (!apiResponse.ok) {
          console.error("WhatsApp API Error:", result);
          return response.status(apiResponse.status).json({ 
            error: result.error?.message || "Failed to send WhatsApp message",
            details: result
          });
        }

        response.status(200).json({ 
          success: true, 
          message_id: result.messages?.[0]?.id,
          result 
        });
      } catch (error) {
        console.error("Failed to send WhatsApp message:", error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // POST /api/crm/whatsapp/generate-response - Generate AI response for WhatsApp message
  app.post(
    "/crm/whatsapp/generate-response",
    async (request, response) => {
      try {
        const body = reqBody(request);
        const { message, workspaceSlug } = body;

        if (!message) {
          return response.status(400).json({ error: "message is required" });
        }

        const { Workspace } = require("../models/workspace");
        const { ApiChatHandler } = require("../utils/chats/apiChatHandler");

        // Get workspace (use provided slug or first available)
        let workspace;
        if (workspaceSlug) {
          workspace = await Workspace.get({ slug: workspaceSlug });
        } else {
          const workspaces = await Workspace.where();
          workspace = workspaces.length > 0 ? workspaces[0] : null;
        }

        if (!workspace) {
          return response.status(404).json({ error: "No workspace available" });
        }

        // Create a temporary workspace object with explicit Spanish prompt
        // Force Spanish response for WhatsApp
        const workspaceWithSpanishPrompt = {
          ...workspace,
          openAiPrompt: "You are a helpful assistant. You MUST respond ONLY in Spanish (Mexican Spanish). Never respond in English. Always respond in Spanish."
        };

        // Generate response using chatbot
        const result = await ApiChatHandler.chatSync({
          workspace: workspaceWithSpanishPrompt,
          message,
          mode: "chat",
          user: null,
          thread: null,
          sessionId: null,
          attachments: [],
          reset: false,
        });

        if (result.error) {
          return response.status(500).json({ error: result.error });
        }

        response.status(200).json({ 
          response: result.textResponse || "Lo siento, no pude generar una respuesta.",
          success: true
        });
      } catch (error) {
        console.error("Failed to generate WhatsApp response:", error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // POST /api/crm/workspaces/update-to-spanish - Update all workspaces to Spanish
  app.post(
    "/crm/workspaces/update-to-spanish",
    [validatedRequest, strictMultiUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const { Workspace } = require("../models/workspace");
        const workspaces = await Workspace.where();

        const SPANISH_PROMPT = "Eres un asistente virtual amigable y profesional. Responde SIEMPRE en español (español de México). Sé conciso, claro y útil. Si no tienes información suficiente, sé honesto y ofrece ayudar de otra manera. Dada la siguiente conversación, contexto relevante y una pregunta de seguimiento, responde con una respuesta a la pregunta actual que el usuario está haciendo. Devuelve solo tu respuesta a la pregunta dada la información anterior siguiendo las instrucciones del usuario según sea necesario.";

        const updated = [];
        for (const workspace of workspaces) {
          const currentPrompt = workspace.openAiPrompt;
          const newPrompt = currentPrompt 
            ? `${currentPrompt}\n\nIMPORTANTE: Responde SIEMPRE en español (español de México).` 
            : SPANISH_PROMPT;

          await Workspace.update(workspace.id, { openAiPrompt: newPrompt });
          updated.push({ id: workspace.id, name: workspace.name, slug: workspace.slug });
        }

        response.status(200).json({ 
          success: true, 
          message: `Actualizados ${updated.length} workspaces a español`,
          workspaces: updated
        });
      } catch (error) {
        console.error("Failed to update workspaces to Spanish:", error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // AGENTES
  // ============================================

  // GET /api/crm/agentes
  app.get(
    "/crm/agentes",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (_request, response) => {
      try {
        const agentes = await Agente.all();
        response.status(200).json({ agentes });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // POST /api/crm/agentes
  app.post(
    "/crm/agentes",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const body = reqBody(request);
        const { nombre, motor, version, prompt_base } = body;

        if (!nombre) {
          return response.status(400).json({ error: "nombre is required" });
        }

        const result = await Agente.create({ nombre, motor, version, prompt_base });
        if (result.error) {
          return response.status(400).json({ error: result.error });
        }

        response.status(201).json({ agente: result.agente });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // PRODUCTOS
  // ============================================

  // GET /api/crm/productos
  app.get(
    "/crm/productos",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const { search, categoria, activo } = request.query;
        const productos = await Producto.all({
          search,
          categoria,
          activo: activo !== undefined ? activo === "true" : undefined,
        });
        response.status(200).json({ productos });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // POST /api/crm/productos
  app.post(
    "/crm/productos",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const body = reqBody(request);
        const { nombre, descripcion, precio, categoria } = body;

        if (!nombre) {
          return response.status(400).json({ error: "nombre is required" });
        }

        const result = await Producto.create({ nombre, descripcion, precio, categoria });
        if (result.error) {
          return response.status(400).json({ error: result.error });
        }

        response.status(201).json({ producto: result.producto });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // PATCH /api/crm/productos/:id
  app.patch(
    "/crm/productos/:id",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const { id } = request.params;
        const body = reqBody(request);

        const result = await Producto.update(id, body);
        if (result.error) {
          return response.status(400).json({ error: result.error });
        }

        response.status(200).json({ producto: result.producto });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // GET /api/crm/productos/categories
  app.get(
    "/crm/productos/categories",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (_request, response) => {
      try {
        const categories = await Producto.categories();
        response.status(200).json({ categories });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // ============================================
  // WEBHOOKS LOG
  // ============================================

  // GET /api/crm/webhooks
  app.get(
    "/crm/webhooks",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const { origen, limit } = request.query;
        const webhooks = await CrmWebhook.list({
          origen,
          limit: limit ? parseInt(limit) : undefined,
        });
        response.status(200).json({ webhooks });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // POST /api/crm/webhook/incoming - Public endpoint for n8n to send data
  app.post(
    "/crm/webhook/incoming",
    async (request, response) => {
      try {
        const body = reqBody(request);
        const { origen, payload, lead_data } = body;

        // Log the webhook
        await CrmWebhook.log({
          origen: origen || "unknown",
          payload: body,
        });

        // If lead_data is included, try to create/update a lead
        if (lead_data && lead_data.name) {
          // Find the first admin user as owner (for webhook-created leads)
          const prisma = require("../utils/prisma");
          const adminUser = await prisma.users.findFirst({
            where: { role: "admin" },
          });

          if (adminUser) {
            // Check if lead exists by phone
            let existingLead = null;
            if (lead_data.phone) {
              existingLead = await Lead.findByPhone(lead_data.phone, adminUser.id);
            }

            if (existingLead) {
              // Update existing lead
              await Lead.update({
                id: existingLead.id,
                userId: adminUser.id,
                updates: {
                  ...(lead_data.name && { name: lead_data.name }),
                  ...(lead_data.ciudad && { ciudad: lead_data.ciudad }),
                  ...(lead_data.interes && { interes: lead_data.interes }),
                  ...(lead_data.etapa && { etapa: lead_data.etapa }),
                },
              });

              // Add conversation if message present
              if (lead_data.mensaje) {
                await Conversacion.create({
                  leadId: existingLead.id,
                  mensaje: lead_data.mensaje,
                  rol: "user",
                });
              }

              // Save WhatsApp message to database if meta data is present
              if (body.meta && body.meta.messageId) {
                try {
                  await WhatsappMessage.create({
                    from: lead_data.phone,
                    messageId: body.meta.messageId,
                    text: lead_data.mensaje || "",
                    timestamp: body.meta.timestamp,
                    raw: body.meta.raw,
                    userId: adminUser.id,
                    autoCreateLead: false, // Lead already exists
                  });
                } catch (error) {
                  console.error("Failed to save WhatsApp message:", error.message);
                  // Don't fail the request if message save fails
                }
              }

              return response.status(200).json({
                success: true,
                action: "updated",
                lead_id: existingLead.id,
              });
            } else {
              // Create new lead
              const result = await Lead.create({
                userId: adminUser.id,
                name: lead_data.name,
                phone: lead_data.phone,
                email: lead_data.email,
                source: origen || "WEBHOOK",
                ciudad: lead_data.ciudad,
                interes: lead_data.interes,
                etapa: lead_data.etapa,
              });

              if (result.lead && lead_data.mensaje) {
                await Conversacion.create({
                  leadId: result.lead.id,
                  mensaje: lead_data.mensaje,
                  rol: "user",
                });
              }

              // Save WhatsApp message to database if meta data is present
              if (body.meta && body.meta.messageId && result.lead) {
                try {
                  await WhatsappMessage.create({
                    from: lead_data.phone,
                    messageId: body.meta.messageId,
                    text: lead_data.mensaje || "",
                    timestamp: body.meta.timestamp,
                    raw: body.meta.raw,
                    userId: adminUser.id,
                    autoCreateLead: false, // Lead already created
                  });
                } catch (error) {
                  console.error("Failed to save WhatsApp message:", error.message);
                  // Don't fail the request if message save fails
                }
              }

              return response.status(201).json({
                success: true,
                action: "created",
                lead_id: result.lead?.id,
              });
            }
          }
        }

        response.status(200).json({ success: true, action: "logged" });
      } catch (error) {
        console.error("WEBHOOK INCOMING ERROR:", error);
        response.status(500).json({ error: error.message });
      }
    }
  );
}

module.exports = { crmEndpoints, LeadStatus, EtapaPipeline, LeadEventType };
