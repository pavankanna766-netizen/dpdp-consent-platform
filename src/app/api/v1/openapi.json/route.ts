import { NextResponse } from "next/server";

export async function GET() {
  const openApiSpec = {
    openapi: "3.1.0",
    info: {
      title: "PrivyStack Developer Platform API",
      version: "1.0.0",
      description: "Statutory DPDP Act 2023 Compliance Automation REST API & Webhook Platform.",
    },
    servers: [
      {
        url: "https://privystack.com/api/v1",
        description: "Production API Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "API Key (pk_live_...)",
        },
      },
    },
    paths: {
      "/scanner/latest": {
        get: {
          summary: "Get latest privacy scan results",
          security: [{ BearerAuth: [] }],
          responses: {
            "200": { description: "Privacy scan audit details" },
            "401": { description: "Invalid API key" },
          },
        },
      },
      "/policies": {
        get: {
          summary: "Get published statutory privacy & cookie policies",
          security: [{ BearerAuth: [] }],
          responses: {
            "200": { description: "Published legal documents" },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}
