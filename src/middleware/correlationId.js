const crypto = require("crypto");

function correlationId(req, res, next) {
  const headerValue = req.header("x-correlation-id");
  const generatedValue = `corr_demo_${crypto.randomUUID()}`;
  req.correlationId = headerValue || generatedValue;
  res.setHeader("x-correlation-id", req.correlationId);
  next();
}

module.exports = { correlationId };
