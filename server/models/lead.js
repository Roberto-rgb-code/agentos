const prisma = require("../utils/prisma");
const { Prisma } = require("@prisma/client");

const LeadStatus = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  QUALIFIED: "QUALIFIED",
  CONVERTED: "CONVERTED",
};

const EtapaPipeline = {
  NUEVO_CLIENTE: "NUEVO_CLIENTE",
  COTIZACION_ENVIADA: "COTIZACION_ENVIADA",
  INTERES_AVANZADO: "INTERES_AVANZADO",
  CERRADA: "CERRADA",
  RECHAZADA: "RECHAZADA",
};

// Probability map based on pipeline stage
const ETAPA_PROBABILIDAD = {
  NUEVO_CLIENTE: 25,
  COTIZACION_ENVIADA: 50,
  INTERES_AVANZADO: 75,
  CERRADA: 100,
  RECHAZADA: 0,
};

const Lead = {
  validStatuses: Object.values(LeadStatus),
  validEtapas: Object.values(EtapaPipeline),

  validations: {
    name: (value) => {
      if (!value || typeof value !== "string") {
        throw new Error("Lead name is required");
      }
      return String(value).trim().slice(0, 255);
    },
    phone: (value) => {
      if (!value) return null;
      const normalized = String(value)
        .replace(/[^\d+]/g, "")
        .slice(0, 20);
      return normalized || null;
    },
    email: (value) => {
      if (!value) return null;
      const email = String(value).trim().toLowerCase().slice(0, 255);
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Invalid email format");
      }
      return email || null;
    },
    status: (value) => {
      const status = String(value).toUpperCase();
      if (!Lead.validStatuses.includes(status)) {
        throw new Error(
          `Invalid status. Allowed: ${Lead.validStatuses.join(", ")}`
        );
      }
      return status;
    },
    etapa: (value) => {
      const etapa = String(value).toUpperCase();
      if (!Lead.validEtapas.includes(etapa)) {
        throw new Error(
          `Invalid etapa. Allowed: ${Lead.validEtapas.join(", ")}`
        );
      }
      return etapa;
    },
    source: (value) => {
      if (!value) return "MANUAL";
      return String(value).slice(0, 100);
    },
    ciudad: (value) => {
      if (!value) return null;
      return String(value).trim().slice(0, 255);
    },
    interes: (value) => {
      if (!value) return null;
      return String(value).trim().slice(0, 500);
    },
  },

  _identifyErrorAndFormatMessage: function (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = error.meta?.target;
        return `A lead with that ${target?.join(", ")} already exists`;
      }
    }
    return error.message;
  },

  // Get all leads for a user
  where: async function (userId, filters = {}) {
    try {
      const where = {
        owner_user_id: userId,
      };

      if (filters.status) where.status = filters.status;
      if (filters.etapa) where.etapa = filters.etapa;
      if (filters.ciudad) where.ciudad = { contains: filters.ciudad, mode: "insensitive" };

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { email: { contains: filters.search, mode: "insensitive" } },
          { phone: { contains: filters.search, mode: "insensitive" } },
          { ciudad: { contains: filters.search, mode: "insensitive" } },
          { interes: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      const leads = await prisma.leads.findMany({
        where,
        include: {
          agente: { select: { id: true, nombre: true } },
          events: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          _count: {
            select: { events: true, conversaciones: true, messages: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: filters.limit || 100,
        skip: filters.skip || 0,
      });

      return leads;
    } catch (error) {
      console.error("FAILED TO FETCH LEADS.", error.message);
      throw error;
    }
  },

  // Get a single lead by ID
  get: async function ({ id, userId }) {
    try {
      const lead = await prisma.leads.findFirst({
        where: {
          id,
          owner_user_id: userId,
        },
        include: {
          agente: true,
          events: {
            orderBy: { createdAt: "desc" },
          },
          messages: {
            orderBy: { received_at: "desc" },
            take: 20,
          },
          conversaciones: {
            orderBy: { fecha: "desc" },
            take: 50,
          },
          historico: true,
        },
      });

      return lead;
    } catch (error) {
      console.error("FAILED TO FETCH LEAD.", error.message);
      throw error;
    }
  },

  // Create a new lead
  create: async function ({ userId, name, phone, email, source, status, ciudad, interes, etapa, agente_id }) {
    try {
      const etapaValue = etapa ? this.validations.etapa(etapa) : EtapaPipeline.NUEVO_CLIENTE;
      const lead = await prisma.leads.create({
        data: {
          owner_user_id: userId,
          name: this.validations.name(name),
          phone: this.validations.phone(phone),
          email: this.validations.email(email),
          source: this.validations.source(source),
          status: status ? this.validations.status(status) : LeadStatus.NEW,
          ciudad: this.validations.ciudad(ciudad),
          interes: this.validations.interes(interes),
          etapa: etapaValue,
          probabilidad_cierre: ETAPA_PROBABILIDAD[etapaValue] || 25,
          agente_id: agente_id || null,
        },
      });

      return { lead, error: null };
    } catch (error) {
      console.error("FAILED TO CREATE LEAD.", error.message);
      return {
        lead: null,
        error: this._identifyErrorAndFormatMessage(error),
      };
    }
  },

  // Update a lead
  update: async function ({ id, userId, updates }) {
    try {
      const data = {};

      if (updates.name !== undefined) data.name = this.validations.name(updates.name);
      if (updates.phone !== undefined) data.phone = this.validations.phone(updates.phone);
      if (updates.email !== undefined) data.email = this.validations.email(updates.email);
      if (updates.status !== undefined) data.status = this.validations.status(updates.status);
      if (updates.source !== undefined) data.source = this.validations.source(updates.source);
      if (updates.ciudad !== undefined) data.ciudad = this.validations.ciudad(updates.ciudad);
      if (updates.interes !== undefined) data.interes = this.validations.interes(updates.interes);
      if (updates.agente_id !== undefined) data.agente_id = updates.agente_id || null;

      if (updates.etapa !== undefined) {
        data.etapa = this.validations.etapa(updates.etapa);
        data.probabilidad_cierre = ETAPA_PROBABILIDAD[data.etapa] || 0;
      }

      const lead = await prisma.leads.update({
        where: {
          id,
          owner_user_id: userId,
        },
        data,
      });

      return { lead, error: null };
    } catch (error) {
      console.error("FAILED TO UPDATE LEAD.", error.message);
      return {
        lead: null,
        error: this._identifyErrorAndFormatMessage(error),
      };
    }
  },

  // Find lead by phone (for WhatsApp association)
  findByPhone: async function (phone, userId) {
    try {
      const normalized = this.validations.phone(phone);
      if (!normalized) return null;

      const lead = await prisma.leads.findFirst({
        where: {
          owner_user_id: userId,
          phone: {
            contains: normalized.replace(/\D/g, ""),
          },
        },
      });

      return lead;
    } catch (error) {
      console.error("FAILED TO FIND LEAD BY PHONE.", error.message);
      return null;
    }
  },

  // Pipeline analytics
  pipelineStats: async function (userId) {
    try {
      const stats = await prisma.leads.groupBy({
        by: ["etapa"],
        where: { owner_user_id: userId },
        _count: { id: true },
        _avg: { probabilidad_cierre: true },
      });

      return stats.map((s) => ({
        etapa: s.etapa,
        count: s._count.id,
        avg_probabilidad: s._avg.probabilidad_cierre,
        probabilidad_default: ETAPA_PROBABILIDAD[s.etapa] || 0,
      }));
    } catch (error) {
      console.error("FAILED TO GET PIPELINE STATS.", error.message);
      throw error;
    }
  },
};

module.exports = { Lead, LeadStatus, EtapaPipeline, ETAPA_PROBABILIDAD };
