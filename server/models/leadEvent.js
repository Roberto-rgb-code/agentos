const prisma = require("../utils/prisma");
const { Prisma } = require("@prisma/client");

const LeadEventType = {
  CONTACTED: "CONTACTED",
  QUALIFIED: "QUALIFIED",
  CONVERTED: "CONVERTED",
  PURCHASE: "PURCHASE",
  REGISTRATION: "REGISTRATION",
  RESERVATION: "RESERVATION",
};

const LeadEvent = {
  validTypes: Object.values(LeadEventType),

  validations: {
    type: (value) => {
      const type = String(value).toUpperCase();
      if (!LeadEvent.validTypes.includes(type)) {
        throw new Error(
          `Invalid event type. Allowed: ${LeadEvent.validTypes.join(", ")}`
        );
      }
      return type;
    },
    revenue: (value) => {
      if (value === null || value === undefined) return null;
      const revenue = parseFloat(value);
      if (isNaN(revenue) || revenue < 0) {
        throw new Error("Revenue must be a positive number");
      }
      return revenue;
    },
    meta: (value) => {
      if (!value) return null;
      if (typeof value === "object") {
        return value; // Prisma Json type accepts objects directly
      }
      // Try to parse if it's a string
      try {
        return JSON.parse(value);
      } catch {
        return { raw: String(value) };
      }
    },
  },

  _identifyErrorAndFormatMessage: function (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return "Lead not found";
      }
    }
    return error.message;
  },

  // Create a new lead event
  create: async function ({ leadId, type, revenue, meta }) {
    try {
      const event = await prisma.lead_events.create({
        data: {
          lead_id: leadId,
          type: this.validations.type(type),
          revenue: revenue !== undefined ? this.validations.revenue(revenue) : null,
          meta: this.validations.meta(meta),
        },
      });

      // Auto-update lead status based on event type
      const statusMap = {
        CONTACTED: "CONTACTED",
        QUALIFIED: "QUALIFIED",
        CONVERTED: "CONVERTED",
        PURCHASE: "CONVERTED",
        REGISTRATION: "CONVERTED",
        RESERVATION: "QUALIFIED",
      };

      const newStatus = statusMap[type];
      if (newStatus) {
        await prisma.leads.update({
          where: { id: leadId },
          data: { status: newStatus },
        });
      }

      return { event, error: null };
    } catch (error) {
      console.error("FAILED TO CREATE LEAD EVENT.", error.message);
      return {
        event: null,
        error: this._identifyErrorAndFormatMessage(error),
      };
    }
  },

  // Get events for a lead
  forLead: async function (leadId) {
    try {
      const events = await prisma.lead_events.findMany({
        where: { lead_id: leadId },
        orderBy: { createdAt: "desc" },
      });

      return events;
    } catch (error) {
      console.error("FAILED TO FETCH LEAD EVENTS.", error.message);
      throw error;
    }
  },

  // Get events in date range for analytics
  inDateRange: async function (userId, fromDate, toDate) {
    try {
      const events = await prisma.lead_events.findMany({
        where: {
          lead: {
            owner_user_id: userId,
          },
          createdAt: {
            gte: new Date(fromDate),
            lte: new Date(toDate),
          },
        },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              owner_user_id: true,
            },
          },
        },
      });

      return events;
    } catch (error) {
      console.error("FAILED TO FETCH EVENTS IN DATE RANGE.", error.message);
      throw error;
    }
  },
};

module.exports = { LeadEvent, LeadEventType };

