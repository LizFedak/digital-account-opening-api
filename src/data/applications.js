const crypto = require("crypto");

const applications = new Map();

const seedApplications = [
  {
    applicationId: "app_demo_1001",
    status: "submitted",
    productCode: "NSB_EVERYDAY_CHECKING",
    accountType: "checking",
    primaryApplicant: {
      firstName: "Alex",
      lastName: "Morgan",
      email: "alex.morgan@example.com",
      phone: "+1-303-555-0101",
      dateOfBirth: "1988-06-12",
      taxResidency: "US",
      address: {
        line1: "1800 Blake Street",
        line2: "Apt 4B",
        city: "Denver",
        state: "CO",
        postalCode: "80202",
        country: "US"
      }
    },
    identityVerification: {
      method: "document-upload",
      documentType: "drivers-license",
      documentLastFour: "2144",
      verificationStatus: "pending"
    },
    funding: {
      initialDepositAmount: 500,
      fundingMethod: "ach",
      externalAccountLastFour: "4301"
    },
    riskScore: 12,
    submittedAt: "2026-05-01T14:12:00.000Z",
    updatedAt: "2026-05-01T14:12:00.000Z"
  },
  {
    applicationId: "app_demo_1002",
    status: "in-review",
    productCode: "NSB_HIGH_YIELD_SAVINGS",
    accountType: "savings",
    primaryApplicant: {
      firstName: "Priya",
      lastName: "Shah",
      email: "priya.shah@example.com",
      phone: "+1-720-555-0198",
      dateOfBirth: "1979-11-03",
      taxResidency: "US",
      address: {
        line1: "455 Wewatta Street",
        line2: "Floor 7",
        city: "Denver",
        state: "CO",
        postalCode: "80202",
        country: "US"
      }
    },
    identityVerification: {
      method: "partner-kyc",
      documentType: "passport",
      documentLastFour: "7781",
      verificationStatus: "verified"
    },
    funding: {
      initialDepositAmount: 2500,
      fundingMethod: "ach",
      externalAccountLastFour: "9084"
    },
    riskScore: 8,
    submittedAt: "2026-05-02T09:35:00.000Z",
    updatedAt: "2026-05-03T11:01:00.000Z"
  },
  {
    applicationId: "app_demo_1003",
    status: "approved",
    productCode: "NSB_PREMIER_MONEY_MARKET",
    accountType: "money-market",
    primaryApplicant: {
      firstName: "Mateo",
      lastName: "Rivera",
      email: "mateo.rivera@example.com",
      phone: "+1-970-555-0164",
      dateOfBirth: "1993-02-24",
      taxResidency: "US",
      address: {
        line1: "90 S Cascade Avenue",
        line2: "Suite 1100",
        city: "Colorado Springs",
        state: "CO",
        postalCode: "80903",
        country: "US"
      }
    },
    identityVerification: {
      method: "branch-verification",
      documentType: "state-id",
      documentLastFour: "5329",
      verificationStatus: "verified"
    },
    funding: {
      initialDepositAmount: 10000,
      fundingMethod: "branch-cash",
      externalAccountLastFour: "0000"
    },
    riskScore: 5,
    submittedAt: "2026-05-04T18:45:00.000Z",
    updatedAt: "2026-05-05T10:14:00.000Z"
  }
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function resetApplications() {
  applications.clear();
  seedApplications.forEach((application) => {
    applications.set(application.applicationId, clone(application));
  });
}

function listApplications(filters = {}) {
  let results = Array.from(applications.values());

  if (filters.status) {
    results = results.filter((application) => application.status === filters.status);
  }

  if (filters.productCode) {
    results = results.filter((application) => application.productCode === filters.productCode);
  }

  return results.map(clone);
}

function getApplication(applicationId) {
  const application = applications.get(applicationId);
  return application ? clone(application) : null;
}

function calculateRiskScore(payload) {
  const depositScore = payload.funding.initialDepositAmount >= 10000 ? 5 : 12;
  const verificationScore = payload.identityVerification.method === "partner-kyc" ? 3 : 6;
  const productScore = payload.accountType === "money-market" ? 4 : 0;
  return Math.min(100, depositScore + verificationScore + productScore);
}

function createApplication(payload) {
  const now = new Date().toISOString();
  const applicationId = `app_demo_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}_${crypto
    .randomUUID()
    .slice(0, 8)}`;

  const application = {
    applicationId,
    status: "submitted",
    productCode: payload.productCode,
    accountType: payload.accountType,
    primaryApplicant: clone(payload.primaryApplicant),
    identityVerification: {
      ...clone(payload.identityVerification),
      verificationStatus: "pending"
    },
    funding: clone(payload.funding),
    riskScore: calculateRiskScore(payload),
    submittedAt: now,
    updatedAt: now
  };

  applications.set(applicationId, clone(application));
  return clone(application);
}

const allowedTransitions = {
  submitted: ["in-review", "cancelled"],
  "in-review": ["approved", "rejected", "cancelled"],
  approved: [],
  rejected: [],
  cancelled: []
};

function canTransition(fromStatus, toStatus) {
  return allowedTransitions[fromStatus]?.includes(toStatus) || false;
}

function updateApplicationStatus(applicationId, status) {
  const application = applications.get(applicationId);
  if (!application) {
    return null;
  }

  if (!canTransition(application.status, status)) {
    return {
      conflict: true,
      currentStatus: application.status,
      requestedStatus: status
    };
  }

  application.status = status;
  application.updatedAt = new Date().toISOString();

  if (status === "in-review" || status === "approved") {
    application.identityVerification.verificationStatus = "verified";
  }

  if (status === "rejected") {
    application.identityVerification.verificationStatus = "failed";
  }

  if (status === "cancelled") {
    application.identityVerification.verificationStatus = "pending";
  }

  applications.set(applicationId, clone(application));
  return clone(application);
}

function deleteApplication(applicationId) {
  const application = applications.get(applicationId);
  if (!application) {
    return null;
  }

  if (application.status === "approved") {
    return {
      conflict: true,
      currentStatus: application.status
    };
  }

  applications.delete(applicationId);
  return {
    applicationId,
    status: "cancelled",
    deleted: true
  };
}

resetApplications();

module.exports = {
  createApplication,
  deleteApplication,
  getApplication,
  listApplications,
  resetApplications,
  updateApplicationStatus
};
