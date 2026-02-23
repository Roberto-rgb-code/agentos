const { IntegrationApiKey } = require("../../models/integrationApiKey");

/**
 * Middleware to validate integration API key from header
 * Sets response.locals.integrationUser with the validated user
 * @returns {function}
 */
function validateIntegrationKey() {
  return async (request, response, next) => {
    const apiKey = request.header("X-Integration-Key");

    if (!apiKey) {
      const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
      if (isDev) {
        console.log("[validateIntegrationKey] Rejected: Missing X-Integration-Key header");
      }
      return response.status(400).json({
        error: "missing_integration_key",
      });
    }

    const validation = await IntegrationApiKey.validate(apiKey);

    if (!validation.valid) {
      const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
      if (isDev) {
        console.log(`[validateIntegrationKey] Rejected: ${validation.error || "Invalid integration API key"}`);
      }

      // Check if it's a plan requirement issue
      if (validation.error && validation.error.includes("plan")) {
        // Extract required plan from error message
        const planMatch = validation.error.match(/required plan: (\w+)/);
        const requiredPlan = planMatch ? planMatch[1] : "premium";
        return response.status(403).json({
          error: "plan_required",
          required: requiredPlan,
        });
      }

      return response.status(401).json({
        error: "invalid_integration_key",
      });
    }

    // Set user in response locals for downstream use
    response.locals.integrationUser = validation.user;
    next();
  };
}

module.exports = { validateIntegrationKey };

