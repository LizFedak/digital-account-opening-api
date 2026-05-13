# Digital Account Opening API

![Northstar Bank](https://img.shields.io/badge/Northstar%20Bank-Digital%20Account%20Opening%20API-1f6feb)

Northstar Bank's Digital Account Opening API powers the intake, review, and lifecycle management of new retail deposit account applications across web, mobile, branch, and partner channels. Product teams, branch systems, digital banking apps, and approved fintech partners use it to submit applicant details, track decisions, and coordinate onboarding status through a consistent enterprise contract. The API exists in Northstar's portfolio to standardize account origination workflows, make end-to-end testing repeatable in Postman Enterprise, and provide a governed integration surface that can be discovered internally or shared safely with partners.

## Quick Start

```bash
npm install
npm start
# Server running at http://localhost:3000
```

The API key defaults to `demo-key`. Set `API_KEY` to override it and `PORT` to change the local port.

## curl Examples

```bash
# Happy path
curl http://localhost:3000/health -H "x-api-key: demo-key"

# Unauthorized
curl http://localhost:3000/health -H "x-api-key: wrong-key"
```

Create an application:

```bash
curl -X POST http://localhost:3000/account-applications \
  -H "x-api-key: demo-key" \
  -H "Content-Type: application/json" \
  -d '{
    "productCode": "NSB_EVERYDAY_CHECKING",
    "accountType": "checking",
    "primaryApplicant": {
      "firstName": "Jordan",
      "lastName": "Lee",
      "email": "jordan.lee@example.com",
      "phone": "+1-303-555-0142",
      "dateOfBirth": "1990-04-17",
      "taxResidency": "US",
      "address": {
        "line1": "100 Market Street",
        "line2": "Suite 220",
        "city": "Denver",
        "state": "CO",
        "postalCode": "80202",
        "country": "US"
      }
    },
    "identityVerification": {
      "method": "document-upload",
      "documentType": "drivers-license",
      "documentLastFour": "1042"
    },
    "funding": {
      "initialDepositAmount": 250,
      "fundingMethod": "ach",
      "externalAccountLastFour": "7788"
    }
  }'
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Returns service health and correlation ID. |
| `POST` | `/account-applications` | Creates a new digital retail account application. |
| `GET` | `/account-applications` | Lists applications with optional `status`, `productCode`, `limit`, and `offset` query parameters. |
| `GET` | `/account-applications/{applicationId}` | Retrieves one account application by ID. |
| `PATCH` | `/account-applications/{applicationId}/status` | Updates an application's lifecycle status. |
| `DELETE` | `/account-applications/{applicationId}` | Cancels and removes a non-approved application from the demo store. |

All endpoints require `x-api-key`. Responses include a correlation ID either in the response body or standard error object, and the service also returns the `x-correlation-id` response header.

## Postman Setup

1. Import `openapi.yaml` as the API definition.
2. Import `postman/collection.json`.
3. Import `postman/environment.json` and select `Northstar Bank — Digital Account Opening API`.
4. Confirm `baseUrl` is `http://localhost:3000` and `apiKey` is `demo-key`.
5. Run the collection folders in order for the full demo: `E2E Workflow`, `Smoke Tests`, `CRUD Operations`, then `Negative Tests`.

The collection captures generated application IDs with `pm.collectionVariables.set()` and reuses them with `pm.collectionVariables.get()` so the workflow can create, read, update, and verify real in-memory resources during a run.

## Docker

```bash
docker build -t northstar/digital-account-opening-api:1.0.0 .
docker run --rm -p 3000:3000 -e API_KEY=demo-key northstar/digital-account-opening-api:1.0.0
```

## Helm

Render the chart locally:

```bash
helm template digital-account-opening-api ./helm/digital-account-opening-api
```

Install or upgrade:

```bash
helm install digital-account-opening-api ./helm/digital-account-opening-api
helm upgrade digital-account-opening-api ./helm/digital-account-opening-api
```

The chart deploys two replicas, a ClusterIP service, an optional ingress at `digital-account-opening-api.northstarbank.internal`, a config map for `PORT`, and a Kubernetes secret for `API_KEY`.

## Postman Enterprise Demo Guide

Use this flow to demonstrate API governance, discovery, and end-to-end testing:

1. Import `openapi.yaml` as a Postman API definition named `Digital Account Opening API`.
2. Link `postman/collection.json` to the API as the executable test collection.
3. Publish the API to the Postman Private API Network for internal Northstar discovery.
4. Share partner-facing docs and the collection through a Postman Partner Workspace.
5. Create a Monitor from the `Smoke Tests` folder for scheduled checks against the deployed endpoint.

End-to-End Testing talking points:

| Talking Point | Demo Moment |
|---|---|
| Contract plus tests | Show the OpenAPI schema linked to the collection. |
| Business workflow coverage | Run the E2E folder to create, retrieve, update, approve, and verify an application. |
| Runtime variables | Show generated applicant email and captured `applicationId` collection variables. |
| Negative coverage | Run invalid auth, validation failure, not-found, and conflict tests. |
| Operational traceability | Highlight `x-correlation-id` request logging and response metadata. |

## Troubleshooting

| Issue | Fix |
|---|---|
| `401 Unauthorized` | Confirm the request includes `x-api-key: demo-key` or matches your `API_KEY` environment variable. |
| `Cannot find module 'express'` | Run `npm install` from the project root. |
| Port already in use | Start with another port, for example `PORT=3001 npm start`, and update the Postman `baseUrl`. |
| Collection variables are empty | Run the create request first or run the full `E2E Workflow` folder in order. |
| Helm probes fail | Ensure the chart value `apiKeySecret.value` matches the API key expected by the container. |
| `helm template` is unavailable | Install Helm 3 locally or render the Kubernetes manifests in a CI environment that includes Helm. |
