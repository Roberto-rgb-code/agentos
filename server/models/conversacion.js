const prisma = require("../utils/prisma");

const Conversacion = {
  // Get conversations for a lead
  forLead: async function (leadId, limit = 50) {
    try {
      return await prisma.conversaciones.findMany({
        where: { lead_id: leadId },
        orderBy: { fecha: "asc" },
        take: limit,
      });
    } catch (error) {
      console.error("FAILED TO FETCH CONVERSACIONES.", error.message);
      throw error;
    }
  },

  // Create a conversation message
  create: async function ({ leadId, mensaje, rol }) {
    try {
      const conv = await prisma.conversaciones.create({
        data: {
          lead_id: leadId,
          mensaje: String(mensaje).trim(),
          rol: rol || "user",
        },
      });
      return { conversacion: conv, error: null };
    } catch (error) {
      console.error("FAILED TO CREATE CONVERSACION.", error.message);
      return { conversacion: null, error: error.message };
    }
  },

  // Count messages for a lead
  countForLead: async function (leadId) {
    try {
      return await prisma.conversaciones.count({
        where: { lead_id: leadId },
      });
    } catch (error) {
      return 0;
    }
  },
};

module.exports = { Conversacion };

