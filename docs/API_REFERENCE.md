# PrivyStack Enterprise API Reference (/v1)

## Overview
PrivyStack provides production-grade REST APIs under the `/api/v1` version namespace for embedding cookie banners, retrieving compliance policies, querying scan history, and managing webhooks.

- **Base URL**: `https://api.privystack.com`
- **Authentication**: Bearer Token via `Authorization: Bearer privy_live_...` or header `x-api-key: privy_live_...`
- **Rate Limits**: 10,000 requests per month (Starter), 100,000 (Growth), 1,000,000 (Enterprise). Header: `x-ratelimit-remaining`.

---

## 1. OpenAPI Specification
- **Endpoint**: `GET /api/v1/openapi.json`
- **Description**: Returns complete OpenAPI 3.0.0 JSON schema for automated SDK generation and Postman collection import.

---

## 2. Public Policy APIs

### 2.1 Get Published Policies
- **Endpoint**: `GET /api/v1/policies?company_id=<ID>&type=privacy_policy`
- **Response**:
```json
{
  "success": true,
  "data": {
    "version": 2,
    "html_content": "<h1>Privacy Policy</h1>...",
    "published_at": "2026-08-01T12:00:00Z"
  }
}
```

---

## 3. Scanner APIs

### 3.1 Get Latest Scan Findings
- **Endpoint**: `GET /api/v1/scanner/latest?company_id=<ID>`
- **Response**:
```json
{
  "success": true,
  "data": {
    "score": 100,
    "status": "completed",
    "pages_scanned": 15,
    "findings_count": 0
  }
}
```
