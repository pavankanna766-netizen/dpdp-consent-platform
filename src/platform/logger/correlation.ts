import { randomUUID } from "node:crypto";

export function getCorrelationId(headers?: Headers): string {
  if (headers) {
    const existing = headers.get("x-request-id") || headers.get("x-correlation-id");
    if (existing) return existing;
  }
  return `req_${randomUUID().replace(/-/g, "").substring(0, 16)}`;
}
