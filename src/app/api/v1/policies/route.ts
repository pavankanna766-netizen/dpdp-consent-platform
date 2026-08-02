import { NextResponse } from "next/server";
import { validateApiKeyHeader } from "@/repositories/api-key.repository";
import { getPublishedPrivacyPolicy } from "@/repositories/privacy-policy.repository";
import { getPublishedCookiePolicy } from "@/repositories/cookie-policy.repository";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Bearer API key" }, { status: 401 });
    }

    const rawKey = authHeader.replace("Bearer ", "").trim();
    const apiKeyRecord = await validateApiKeyHeader(rawKey);

    if (!apiKeyRecord) {
      return NextResponse.json({ error: "Invalid or expired API key" }, { status: 401 });
    }

    const companyId = apiKeyRecord.company_id;
    const [privacyRes, cookieRes] = await Promise.all([
      getPublishedPrivacyPolicy(companyId),
      getPublishedCookiePolicy(companyId),
    ]);

    return NextResponse.json({
      version: "v1",
      companyId,
      policies: {
        privacyPolicy: privacyRes.data
          ? { version: privacyRes.data.version, publishedAt: privacyRes.data.published_at, content: privacyRes.data.content_html }
          : null,
        cookiePolicy: cookieRes.data
          ? { version: cookieRes.data.version, publishedAt: cookieRes.data.published_at, content: cookieRes.data.content_html }
          : null,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
