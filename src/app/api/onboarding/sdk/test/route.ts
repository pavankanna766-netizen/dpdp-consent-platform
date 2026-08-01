import { NextResponse } from "next/server";
import { testSdkConnection } from "@/services/onboarding.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, apiKey } = body;

    if (!companyId || !apiKey) {
      return NextResponse.json(
        { error: "Missing companyId or apiKey" },
        { status: 400 }
      );
    }

    const result = await testSdkConnection(companyId, apiKey);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Handshake error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
