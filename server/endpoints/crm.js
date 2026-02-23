const { reqBody, userFromSession } = require("../utils/http");
const { validatedRequest } = require("../utils/middleware/validatedRequest");
const {
  strictMultiUserRoleValid,
  ROLES,
} = require("../utils/middleware/multiUserProtected");
const { Lead, LeadStatus } = require("../models/lead");
const { LeadEvent, LeadEventType } = require("../models/leadEvent");

function crmEndpoints(app) {
  if (!app) return;

  // GET /api/crm/leads - List all leads for the user
  app.get(
    "/crm/leads",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) {
          return response.sendStatus(401).end();
        }

        const { status, search, limit, skip } = request.query;

        const leads = await Lead.where(user.id, {
          status,
          search,
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
        if (!user) {
          return response.sendStatus(401).end();
        }

        const body = reqBody(request);
        const { name, phone, email, source, status } = body;

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
        if (!user) {
          return response.sendStatus(401).end();
        }

        const { id } = request.params;
        const lead = await Lead.get({ id, userId: user.id });

        if (!lead) {
          return response.sendStatus(404).end();
        }

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
        if (!user) {
          return response.sendStatus(401).end();
        }

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

        if (!result.lead) {
          return response.sendStatus(404).end();
        }

        response.status(200).json({ lead: result.lead });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // POST /api/crm/leads/:id/events - Create a lead event
  app.post(
    "/crm/leads/:id/events",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) {
          return response.sendStatus(401).end();
        }

        const { id } = request.params;
        const body = reqBody(request);
        const { type, revenue, meta } = body;

        if (!type) {
          return response.status(400).json({ error: "Event type is required" });
        }

        // Verify lead belongs to user
        const lead = await Lead.get({ id, userId: user.id });
        if (!lead) {
          return response.sendStatus(404).end();
        }

        const result = await LeadEvent.create({
          leadId: id,
          type,
          revenue,
          meta,
        });

        if (result.error) {
          return response.status(400).json({ error: result.error });
        }

        // Fetch updated lead with events
        const updatedLead = await Lead.get({ id, userId: user.id });

        response.status(201).json({
          event: result.event,
          lead: updatedLead,
        });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );

  // GET /api/crm/leads/:id/events - Get events for a lead
  app.get(
    "/crm/leads/:id/events",
    [validatedRequest, strictMultiUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        if (!user) {
          return response.sendStatus(401).end();
        }

        const { id } = request.params;

        // Verify lead belongs to user
        const lead = await Lead.get({ id, userId: user.id });
        if (!lead) {
          return response.sendStatus(404).end();
        }

        const events = await LeadEvent.forLead(id);

        response.status(200).json({ events });
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
    }
  );
}

module.exports = { crmEndpoints, LeadStatus, LeadEventType };

