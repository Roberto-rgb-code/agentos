const prisma = require("../utils/prisma");

const CrmWebhook = {
  // Log a webhook
  log: async function ({ origen, payload }) {
    try {
      return await prisma.crm_webhooks.create({
        data: {
          origen: String(origen).toLowerCase(),
          payload: payload || null,
        },
      });
    } catch (error) {
      console.error("FAILED TO LOG CRM WEBHOOK.", error.message);
      return null;
    }
  },

  // List webhooks
  list: async function (filters = {}) {
    try {
      const where = {};
      if (filters.origen) where.origen = filters.origen;

      return await prisma.crm_webhooks.findMany({
        where,
        orderBy: { fecha: "desc" },
        take: filters.limit || 50,
      });
    } catch (error) {
      console.error("FAILED TO FETCH CRM WEBHOOKS.", error.message);
      throw error;
    }
  },
};

module.exports = { CrmWebhook };

