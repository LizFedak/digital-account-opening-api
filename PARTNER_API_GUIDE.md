# Northstar Bank Digital Account Opening API Partner Guide

## Overview

The Digital Account Opening API gives approved Northstar Bank partners a governed way to submit and track retail deposit account applications. Partners can create an application, retrieve its current status, and receive clear lifecycle signals as Northstar validates identity, funding, and eligibility details.

This demo API is intentionally lightweight and uses in-memory data, but the contract mirrors the type of enterprise integration surface partners would use in a production onboarding program.

## Authentication

Every request requires an API key in the `x-api-key` header.

```bash
curl http://localhost:3002/account-applications \
  -H "x-api-key: demo-key" \
  -H "x-correlation-id: corr_demo_partner_001"
```

Use `x-correlation-id` on every partner call so Northstar support teams can trace requests across partner, gateway, and service logs. If the header is omitted, the API generates one using the `corr_demo_<uuid>` format.

## Example Integration Workflows

### Submit a New Application

1. Collect applicant profile, address, identity document, and initial funding details in the partner experience.
2. Call `POST /account-applications`.
3. Store the returned `applicationId` in the partner system.
4. Display the returned `status` to the applicant.

### Check Application Status

1. Call `GET /account-applications/{applicationId}` using the ID returned at submission time.
2. Use `status` to update the partner experience.
3. Treat `approved`, `rejected`, and `cancelled` as terminal statuses.

### Operational Reconciliation

1. Call `GET /account-applications?status=submitted&limit=25&offset=0`.
2. Page through results for workflow audits or customer-service review.
3. Use the response `meta.correlationId` when opening a support ticket.

## Lifecycle Statuses

| Status | Meaning |
|---|---|
| `submitted` | Application has been received and awaits review. |
| `in-review` | Identity, risk, and funding checks are in progress. |
| `approved` | Application passed review and is ready for account setup. |
| `rejected` | Application failed one or more review checks. |
| `cancelled` | Application was cancelled before completion. |

## Rate Limits and Usage Guidelines

These are mock demo limits for partner documentation and Postman testing:

| Limit | Value |
|---|---|
| Burst limit | 60 requests per minute per API key |
| Daily limit | 25,000 requests per partner workspace |
| Maximum page size | 100 applications |
| Support response target | 1 business day for non-production demo issues |

Partners should retry only idempotent `GET` requests automatically. For `POST`, `PATCH`, and `DELETE`, use application status reads to reconcile ambiguous outcomes before resubmitting.

## Error Handling

Errors use a consistent shape:

```json
{
  "error": {
    "code": "APPLICATION_NOT_FOUND",
    "message": "Account application app_demo_unknown was not found.",
    "correlationId": "corr_demo_partner_001"
  }
}
```

Include the `error.correlationId`, request timestamp, endpoint, and request method when contacting Northstar support.

## Contact

Northstar Bank API Partner Team  
Email: api-partners@northstarbank.example  
Developer portal: https://developer.northstarbank.example  
Support hours: Monday-Friday, 8:00 AM-6:00 PM Mountain Time
