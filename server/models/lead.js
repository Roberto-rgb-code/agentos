const prisma = require("../utils/prisma");
const { Prisma } = require("@prisma/client");

const LeadStatus = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  QUALIFIED: "QUALIFIED",
  CONVERTED: "CONVERTED",
};

const Lead = {
  validStatuses: Object.values(LeadStatus),

  validations: {
    name: (value) => {
      if (!value || typeof value !== "string") {
        throw new Error("Lead name is required");
      }
      return String(value).trim().slice(0, 255);
    },
    phone: (value) => {
      if (!value) return null;
      // Normalize phone: remove non-digits, keep leading +
      const normalized = String(value)
        .replace(/[^\d+]/g, "")
        .slice(0, 20);
      return normalized || null;
    },
    email: (value) => {
      if (!value) return null;
      const email = String(value).trim().toLowerCase().slice(0, 255);
      // Basic email validation
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
    source: (value) => {
      if (!value) return "MANUAL";
      return String(value).slice(0, 100);
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

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { email: { contains: filters.search, mode: "insensitive" } },
          { phone: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      const leads = await prisma.leads.findMany({
        where,
        include: {
          events: {
            orderBy: { createdAt: "desc" },
            take: 10, // Last 10 events
          },
          _count: {
            select: { events: true },
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
          events: {
            orderBy: { createdAt: "desc" },
          },
          messages: {
            orderBy: { received_at: "desc" },
            take: 20,
          },
        },
      });

      return lead;
    } catch (error) {
      console.error("FAILED TO FETCH LEAD.", error.message);
      throw error;
    }
  },

  // Create a new lead
  create: async function ({ userId, name, phone, email, source, status }) {
    try {
      const lead = await prisma.leads.create({
        data: {
          owner_user_id: userId,
          name: this.validations.name(name),
          phone: this.validations.phone(phone),
          email: this.validations.email(email),
          source: this.validations.source(source),
          status: status
            ? this.validations.status(status)
            : LeadStatus.NEW,
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

      if (updates.name !== undefined) {
        data.name = this.validations.name(updates.name);
      }
      if (updates.phone !== undefined) {
        data.phone = this.validations.phone(updates.phone);
      }
      if (updates.email !== undefined) {
        data.email = this.validations.email(updates.email);
      }
      if (updates.status !== undefined) {
        data.status = this.validations.status(updates.status);
      }
      if (updates.source !== undefined) {
        data.source = this.validations.source(updates.source);
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
            contains: normalized.replace(/\D/g, ""), // Search by digits only
          },
        },
      });

      return lead;
    } catch (error) {
      console.error("FAILED TO FIND LEAD BY PHONE.", error.message);
      return null;
    }
  },
};

module.exports = { Lead, LeadStatus };

