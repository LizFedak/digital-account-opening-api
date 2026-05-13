const allowedStatuses = ["submitted", "in-review", "approved", "rejected", "cancelled"];
const allowedAccountTypes = ["checking", "savings", "money-market"];
const allowedFundingMethods = ["ach", "debit-card", "branch-cash", "none"];
const allowedVerificationMethods = ["document-upload", "partner-kyc", "branch-verification"];
const allowedDocumentTypes = ["drivers-license", "passport", "state-id"];

function createHttpError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function requireString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw createHttpError(400, "VALIDATION_ERROR", `${fieldName} is required.`);
  }
}

function requireEnum(value, fieldName, allowedValues) {
  requireString(value, fieldName);
  if (!allowedValues.includes(value)) {
    throw createHttpError(400, "VALIDATION_ERROR", `${fieldName} must be one of: ${allowedValues.join(", ")}.`);
  }
}

function requireLastFour(value, fieldName) {
  requireString(value, fieldName);
  if (!/^[0-9]{4}$/.test(value)) {
    throw createHttpError(400, "VALIDATION_ERROR", `${fieldName} must be exactly four digits.`);
  }
}

function validateCreateApplicationPayload(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw createHttpError(400, "VALIDATION_ERROR", "Request body must be a JSON object.");
  }

  requireString(body.productCode, "productCode");
  requireEnum(body.accountType, "accountType", allowedAccountTypes);

  const applicant = body.primaryApplicant || {};
  requireString(applicant.firstName, "primaryApplicant.firstName");
  requireString(applicant.lastName, "primaryApplicant.lastName");
  requireString(applicant.email, "primaryApplicant.email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicant.email)) {
    throw createHttpError(400, "VALIDATION_ERROR", "primaryApplicant.email must be a valid email address.");
  }
  requireString(applicant.phone, "primaryApplicant.phone");
  requireString(applicant.dateOfBirth, "primaryApplicant.dateOfBirth");
  requireString(applicant.taxResidency, "primaryApplicant.taxResidency");

  const address = applicant.address || {};
  requireString(address.line1, "primaryApplicant.address.line1");
  requireString(address.city, "primaryApplicant.address.city");
  requireString(address.state, "primaryApplicant.address.state");
  requireString(address.postalCode, "primaryApplicant.address.postalCode");
  requireString(address.country, "primaryApplicant.address.country");

  const identityVerification = body.identityVerification || {};
  requireEnum(identityVerification.method, "identityVerification.method", allowedVerificationMethods);
  requireEnum(identityVerification.documentType, "identityVerification.documentType", allowedDocumentTypes);
  requireLastFour(identityVerification.documentLastFour, "identityVerification.documentLastFour");

  const funding = body.funding || {};
  if (typeof funding.initialDepositAmount !== "number" || funding.initialDepositAmount < 0) {
    throw createHttpError(400, "VALIDATION_ERROR", "funding.initialDepositAmount must be a non-negative number.");
  }
  requireEnum(funding.fundingMethod, "funding.fundingMethod", allowedFundingMethods);
  requireLastFour(funding.externalAccountLastFour, "funding.externalAccountLastFour");
}

function validateUpdateStatusPayload(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw createHttpError(400, "VALIDATION_ERROR", "Request body must be a JSON object.");
  }

  requireEnum(body.status, "status", allowedStatuses);
  requireString(body.reason, "reason");
  if (body.reason.trim().length < 3) {
    throw createHttpError(400, "VALIDATION_ERROR", "reason must be at least 3 characters.");
  }
}

module.exports = {
  allowedStatuses,
  createHttpError,
  validateCreateApplicationPayload,
  validateUpdateStatusPayload
};
