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
