import { NextResponse } from "next/server";

import { rateLimitEngine } from "@/platform/rate-limit";
import { RateLimitError } from "@/platform/errors";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  "X-Content-Type-Options": "nosniff",
};

export function publicBannerHeaders(headers: HeadersInit = {}) {
  return { ...corsHeaders, ...headers };
}

export function publicBannerOptions() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export function withPublicBannerHeaders(response: Response) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  return new NextResponse(response.body, { status: response.status, statusText: response.statusText, headers });
}

export async function limitPublicBannerRequest(request: Request, limit: number) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const result = await rateLimitEngine.consume(`banner:${key}`, limit, 60_000);
  if (!result.allowed) throw new RateLimitError();
}
