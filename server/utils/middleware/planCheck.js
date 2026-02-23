const { userFromSession } = require("../http");
const { SystemSettings } = require("../../models/systemSettings");

const PLANS = {
  BASIC: "basic",
  PREMIUM: "premium",
};

/**
 * Middleware to check if user has required plan
 * @param {string[]} requiredPlans - Plans that can access the route (e.g., ["premium"])
 * @returns {function}
 */
function requirePlan(requiredPlans = []) {
  return async (request, response, next) => {
    // If no plan requirement, allow all
    if (requiredPlans.length === 0) {
      next();
      return;
    }

    const multiUserMode =
      response.locals?.multiUserMode ??
      (await SystemSettings.isMultiUserMode());
    
    if (!multiUserMode) {
      // In single-user mode, assume premium for development
      next();
      return;
    }

    const user =
      response.locals?.user ?? (await userFromSession(request, response));
    
    if (!user) {
      return response.sendStatus(401).end();
    }

    const userPlan = user.plan || PLANS.BASIC;

    if (requiredPlans.includes(userPlan)) {
      next();
      return;
    }

    // User doesn't have required plan
    return response.status(403).json({
      error: "This feature requires a premium plan",
      requiredPlans,
      currentPlan: userPlan,
    });
  };
}

/**
 * Get user plan (helper function)
 */
async function getUserPlan(request, response) {
  const multiUserMode =
    response.locals?.multiUserMode ??
    (await SystemSettings.isMultiUserMode());
  
  if (!multiUserMode) {
    return PLANS.PREMIUM; // Default to premium in single-user mode
  }

  const user =
    response.locals?.user ?? (await userFromSession(request, response));
  
  return user?.plan || PLANS.BASIC;
}

module.exports = {
  PLANS,
  requirePlan,
  getUserPlan,
};

