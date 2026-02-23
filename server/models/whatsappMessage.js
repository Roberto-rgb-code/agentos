const prisma = require("../utils/prisma");
const { Prisma } = require("@prisma/client");
const { Lead } = require("./lead");

const WhatsappMessage = {
  validations: {
    wa_from: (value) => {
      if (!value || typeof value !== "string") {
        throw new Error("WhatsApp from number is required");
      }
      // Normalize: remove non-digits except +
      return String(value)
        .replace(/[^\d+]/g, "")
        .slice(0, 20);
    },
    wa_message_id: (value) => {
      if (!value || typeof value !== "string") {
        throw new Error("WhatsApp message ID is required");
      }
      return String(value).slice(0, 255);
    },
    body: (value) => {
      if (!value) return "";
      return String(value);
    },
    raw: (value) => {
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
      if (error.code === "P2002") {
        return "Message with this ID already exists";
      }
    }
    return error.message;
  },

  // Create a new WhatsApp message and optionally associate with lead
  create: async function ({ from, messageId, text, timestamp, raw, userId, autoCreateLead = false }) {
    try {
      const normalizedPhone = this.validations.wa_from(from);

      // Try to find existing lead by phone
      let lead = await Lead.findByPhone(normalizedPhone, userId);

      // Auto-create lead if not found and autoCreateLead is true
      if (!lead && autoCreateLead) {
        const leadResult = await Lead.create({
          userId,
          name: `Lead ${normalizedPhone.slice(-4)}`, // Last 4 digits as name
          phone: normalizedPhone,
          source: "WHATSAPP",
          status: "NEW",
        });
        lead = leadResult.lead;
      }

      const message = await prisma.whatsapp_messages.create({
        data: {
          lead_id: lead?.id || null,
          wa_from: normalizedPhone,
          wa_message_id: this.validations.wa_message_id(messageId),
          body: this.validations.body(text),
          raw: this.validations.raw(raw),
          received_at: timestamp ? new Date(timestamp) : new Date(),
        },
      });

      return { message, lead, error: null };
    } catch (error) {
      console.error("FAILED TO CREATE WHATSAPP MESSAGE.", error.message);
      return {
        message: null,
        lead: null,
        error: this._identifyErrorAndFormatMessage(error),
      };
    }
  },

  // Get messages for a lead
  forLead: async function (leadId) {
    try {
      const messages = await prisma.whatsapp_messages.findMany({
        where: { lead_id: leadId },
        orderBy: { received_at: "desc" },
      });

      return messages;
    } catch (error) {
      console.error("FAILED TO FETCH WHATSAPP MESSAGES.", error.message);
      throw error;
    }
  },

  // Get all messages for a user
  where: async function (userId, filters = {}) {
    try {
      const where = {
        lead: {
          owner_user_id: userId,
        },
      };

      if (filters.leadId) {
        where.lead_id = filters.leadId;
      }

      const messages = await prisma.whatsapp_messages.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { received_at: "desc" },
        take: filters.limit || 100,
        skip: filters.skip || 0,
      });

      return messages;
    } catch (error) {
      console.error("FAILED TO FETCH WHATSAPP MESSAGES.", error.message);
      throw error;
    }
  },
};

module.exports = { WhatsappMessage };

