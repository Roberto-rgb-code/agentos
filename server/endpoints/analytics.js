const { queryParams, userFromSession } = require("../utils/http");
const { validatedRequest } = require("../utils/middleware/validatedRequest");
const {
  strictMultiUserRoleValid,
  ROLES,
} = require("../utils/middleware/multiUserProtected");
const { requirePlan } = require("../utils/middleware/planCheck");
const { LeadEvent, LeadEventType } = require("../models/leadEvent");
const { Lead, LeadStatus } = require("../models/lead");
const prisma = require("../utils/prisma");

function analyticsEndpoints(app) {
  if (!app) return;

  // GET /api/analytics/kpis - Get KPIs for date range (Premium only)
  app.get(
    "/analytics/kpis",
    [
      validatedRequest,
      strictMultiUserRoleValid([ROLES.all]),
      requirePlan(["premium"]),
    ],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) {
          return response.sendStatus(401).end();
        }

        const { from, to } = queryParams(request);

        // Default to last 30 days if not provided
        const fromDate = from
          ? new Date(from)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const toDate = to ? new Date(to) : new Date();

        // Get all events in date range
        const events = await LeadEvent.inDateRange(
          user.id,
          fromDate,
          toDate
        );

        // Calculate KPIs
        // 1. Leads contactados: Count unique leads with CONTACTED event or status >= CONTACTED
        const contactedEventLeads = new Set();
        events
          .filter((e) => e.type === LeadEventType.CONTACTED)
          .forEach((e) => contactedEventLeads.add(e.lead_id));

        // Also count leads with status >= CONTACTED in the date range
        const contactedLeads = await prisma.leads.findMany({
          where: {
            owner_user_id: user.id,
            status: {
              in: [LeadStatus.CONTACTED, LeadStatus.QUALIFIED, LeadStatus.CONVERTED],
            },
            createdAt: {
              lte: toDate,
            },
          },
          select: { id: true },
        });

        contactedLeads.forEach((l) => contactedEventLeads.add(l.id));

        const leadsContactados = contactedEventLeads.size;

        // 2. Leads calificados: Count unique leads with QUALIFIED event
        const qualifiedLeads = new Set();
        events
          .filter((e) => e.type === LeadEventType.QUALIFIED)
          .forEach((e) => qualifiedLeads.add(e.lead_id));

        const leadsCalificados = qualifiedLeads.size;

        // 3. Tasa de conversión: CONVERTED / CONTACTED
        const convertedLeads = new Set();
        events
          .filter(
            (e) =>
              e.type === LeadEventType.CONVERTED ||
              e.type === LeadEventType.PURCHASE ||
              e.type === LeadEventType.REGISTRATION
          )
          .forEach((e) => convertedLeads.add(e.lead_id));

        const leadsConvertidos = convertedLeads.size;
        const tasaConversion =
          leadsContactados > 0
            ? (leadsConvertidos / leadsContactados) * 100
            : 0;

        // 4. RPR (Revenue per Recipient)
        // Revenue = sum of revenue from PURCHASE events (or CONVERTED if no PURCHASE)
        const purchaseEvents = events.filter(
          (e) => e.type === LeadEventType.PURCHASE && e.revenue
        );
        const revenue = purchaseEvents.reduce((sum, e) => {
          return sum + parseFloat(e.revenue || 0);
        }, 0);

        // Recipients = leads contactados (unique leads with CONTACTED event)
        const recipients = leadsContactados;
        const rpr = recipients > 0 ? revenue / recipients : 0;

        response.status(200).json({
          kpis: {
            leadsContactados,
            leadsCalificados,
            leadsConvertidos,
            tasaConversion: parseFloat(tasaConversion.toFixed(2)),
            revenue: parseFloat(revenue.toFixed(2)),
            recipients,
            rpr: parseFloat(rpr.toFixed(2)),
          },
          dateRange: {
            from: fromDate.toISOString(),
            to: toDate.toISOString(),
          },
        });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );
}

module.exports = { analyticsEndpoints };

