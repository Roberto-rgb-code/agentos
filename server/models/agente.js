const prisma = require("../utils/prisma");

const Agente = {
  // List all agents
  all: async function () {
    try {
      return await prisma.agentes.findMany({
        where: { activo: true },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { leads: true } },
        },
      });
    } catch (error) {
      console.error("FAILED TO FETCH AGENTES.", error.message);
      throw error;
    }
  },

  // Get agent by ID
  get: async function (id) {
    try {
      return await prisma.agentes.findUnique({
        where: { id },
        include: {
          leads: {
            select: { id: true, name: true, etapa: true },
            take: 20,
          },
        },
      });
    } catch (error) {
      console.error("FAILED TO FETCH AGENTE.", error.message);
      return null;
    }
  },

  // Create agent
  create: async function ({ nombre, motor, version, prompt_base }) {
    try {
      const agente = await prisma.agentes.create({
        data: {
          nombre: String(nombre).trim(),
          motor: motor || "ollama",
          version: version || null,
          prompt_base: prompt_base || null,
        },
      });
      return { agente, error: null };
    } catch (error) {
      console.error("FAILED TO CREATE AGENTE.", error.message);
      return { agente: null, error: error.message };
    }
  },

  // Update agent
  update: async function (id, updates) {
    try {
      const agente = await prisma.agentes.update({
        where: { id },
        data: updates,
      });
      return { agente, error: null };
    } catch (error) {
      console.error("FAILED TO UPDATE AGENTE.", error.message);
      return { agente: null, error: error.message };
    }
  },
};

module.exports = { Agente };

