import { NextResponse } from "next/server";
import { getLatestScan } from "@/repositories/scanner.repository";
import { validateApiKeyHeader } from "@/repositories/api-key.repository";

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

    const scanRes = await getLatestScan(apiKeyRecord.company_id);
    return NextResponse.json({
      version: "v1",
      companyId: apiKeyRecord.company_id,
      scan: scanRes.data || null,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
