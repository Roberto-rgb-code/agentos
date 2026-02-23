const prisma = require("../utils/prisma");
const { Prisma } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");

const IntegrationApiKey = {
  // Generate a secure API key
  generateKey: function () {
    return `int_${uuidv4().replace(/-/g, "")}`;
  },

  // Create a new integration API key
  create: async function ({ userId, name, planRequired = "premium" }) {
    try {
      // Verify user has the required plan
      const { User } = require("./user");
      const user = await User.get({ id: userId });
      if (!user) {
        return { key: null, error: "User not found" };
      }

      if (user.plan !== planRequired) {
        return {
          key: null,
          error: `User must have ${planRequired} plan to create integration keys`,
        };
      }

      const key = this.generateKey();
      const apiKey = await prisma.integration_api_keys.create({
        data: {
          key,
          name,
          user_id: userId,
          plan_required: planRequired,
        },
      });

      return { key: apiKey, error: null };
    } catch (error) {
      console.error("FAILED TO CREATE INTEGRATION API KEY.", error.message);
      return {
        key: null,
        error: error.message,
      };
    }
  },

  // Validate API key and return associated user
  validate: async function (key) {
    try {
      const apiKey = await prisma.integration_api_keys.findFirst({
        where: {
          key,
          active: true,
        },
        include: {
          user: true,
        },
      });

      if (!apiKey) {
        return { valid: false, user: null, error: "Invalid API key" };
      }

      // Update last used timestamp
      await prisma.integration_api_keys.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      });

      // Verify user still has required plan
      if (apiKey.user.plan !== apiKey.plan_required) {
        return {
          valid: false,
          user: null,
          error: `User plan does not match required plan: ${apiKey.plan_required}`,
        };
      }

      return { valid: true, user: apiKey.user, error: null };
    } catch (error) {
      console.error("FAILED TO VALIDATE API KEY.", error.message);
      return { valid: false, user: null, error: error.message };
    }
  },

  // Get all keys for a user
  forUser: async function (userId) {
    try {
      const keys = await prisma.integration_api_keys.findMany({
        where: { user_id: userId },
        orderBy: { createdAt: "desc" },
      });

      return keys;
    } catch (error) {
      console.error("FAILED TO FETCH API KEYS.", error.message);
      throw error;
    }
  },

  // Revoke (deactivate) an API key
  revoke: async function (keyId, userId) {
    try {
      const apiKey = await prisma.integration_api_keys.updateMany({
        where: {
          id: keyId,
          user_id: userId,
        },
        data: {
          active: false,
        },
      });

      return { success: apiKey.count > 0, error: null };
    } catch (error) {
      console.error("FAILED TO REVOKE API KEY.", error.message);
      return { success: false, error: error.message };
    }
  },
};

module.exports = { IntegrationApiKey };

