const express = require("express");

const { requireApiKey } = require("./middleware/auth");
const { correlationId } = require("./middleware/correlationId");
const { errorResponse } = require("./utils/response");
const accountApplicationsRouter = require("./routes/accountApplications");
const healthRouter = require("./routes/health");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(correlationId);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} correlationId=${req.correlationId}`);
  next();
});

app.use(requireApiKey);
app.use("/health", healthRouter);
app.use("/account-applications", accountApplicationsRouter);

app.use((req, res) => {
  res.status(404).json(
    errorResponse("ROUTE_NOT_FOUND", `Route ${req.method} ${req.originalUrl} was not found.`, req.correlationId)
  );
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    res.status(400).json(errorResponse("INVALID_JSON", "Request body must be valid JSON.", req.correlationId));
    return;
  }

  const status = Number.isInteger(err.status) ? err.status : 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = status >= 500 ? "An unexpected error occurred." : err.message;
  res.status(status).json(errorResponse(code, message, req.correlationId));
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Digital Account Opening API running at http://localhost:${port}`);
  });
}

module.exports = app;
