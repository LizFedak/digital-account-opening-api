const express = require("express");

const {
  createApplication,
  deleteApplication,
  getApplication,
  listApplications,
  updateApplicationStatus
} = require("../data/applications");
const { allowedStatuses, createHttpError, validateCreateApplicationPayload, validateUpdateStatusPayload } = require("../utils/validation");
const { envelope } = require("../utils/response");

const router = express.Router();

router.post("/", (req, res, next) => {
  try {
    validateCreateApplicationPayload(req.body);
    const application = createApplication(req.body);
    res
      .status(201)
      .setHeader("Location", `/account-applications/${application.applicationId}`)
      .json(envelope(application, req.correlationId));
  } catch (error) {
    next(error);
  }
});

router.get("/", (req, res, next) => {
  try {
    const { status, productCode } = req.query;
    const limit = parseIntegerQuery(req.query.limit, "limit", 25, 1, 100);
    const offset = parseIntegerQuery(req.query.offset, "offset", 0, 0, Number.MAX_SAFE_INTEGER);

    if (status && !allowedStatuses.includes(status)) {
      throw createHttpError(400, "VALIDATION_ERROR", `status must be one of: ${allowedStatuses.join(", ")}.`);
    }

    const filteredApplications = listApplications({ status, productCode });
    const pagedApplications = filteredApplications.slice(offset, offset + limit);

    res.json(
      envelope(pagedApplications, req.correlationId, {
        count: pagedApplications.length,
        limit,
        offset
      })
    );
  } catch (error) {
    next(error);
  }
});

router.get("/:applicationId", (req, res, next) => {
  try {
    const application = getApplication(req.params.applicationId);

    if (!application) {
      throw createHttpError(
        404,
        "APPLICATION_NOT_FOUND",
        `Account application ${req.params.applicationId} was not found.`
      );
    }

    res.json(envelope(application, req.correlationId));
  } catch (error) {
    next(error);
  }
});

router.patch("/:applicationId/status", (req, res, next) => {
  try {
    validateUpdateStatusPayload(req.body);
    const result = updateApplicationStatus(req.params.applicationId, req.body.status);

    if (!result) {
      throw createHttpError(
        404,
        "APPLICATION_NOT_FOUND",
        `Account application ${req.params.applicationId} was not found.`
      );
    }

    if (result.conflict) {
      throw createHttpError(
        409,
        "INVALID_STATUS_TRANSITION",
        `Cannot transition application from ${result.currentStatus} to ${result.requestedStatus}.`
      );
    }

    res.json(envelope(result, req.correlationId));
  } catch (error) {
    next(error);
  }
});

router.delete("/:applicationId", (req, res, next) => {
  try {
    const result = deleteApplication(req.params.applicationId);

    if (!result) {
      throw createHttpError(
        404,
        "APPLICATION_NOT_FOUND",
        `Account application ${req.params.applicationId} was not found.`
      );
    }

    if (result.conflict) {
      throw createHttpError(
        409,
        "APPLICATION_ALREADY_APPROVED",
        "Approved account applications cannot be deleted in this demo workflow."
      );
    }

    res.json(envelope(result, req.correlationId));
  } catch (error) {
    next(error);
  }
});

function parseIntegerQuery(value, fieldName, defaultValue, min, max) {
  if (value === undefined) {
    return defaultValue;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw createHttpError(400, "VALIDATION_ERROR", `${fieldName} must be an integer between ${min} and ${max}.`);
  }

  return parsed;
}

module.exports = router;
