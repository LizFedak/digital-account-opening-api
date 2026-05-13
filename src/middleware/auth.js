const { errorResponse } = require("../utils/response");

function requireApiKey(req, res, next) {
  const expectedApiKey = process.env.API_KEY || "demo-key";
  const providedApiKey = req.header("x-api-key");

  if (!providedApiKey || providedApiKey !== expectedApiKey) {
    res.status(401).json(
      errorResponse("UNAUTHORIZED", "A valid x-api-key header is required.", req.correlationId)
    );
    return;
  }

  next();
}

module.exports = { requireApiKey };
