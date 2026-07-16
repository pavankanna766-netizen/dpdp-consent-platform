import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ensureCompany } from "@/services/company.service";
import { summaryService } from "@/modules/scanner";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const company = await ensureCompany(userId, "My Company");
    const summary = await summaryService.get(company.id, id);

    if (!summary || !summary.scan || summary.scan.company_id !== company.id) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    return NextResponse.json(summary);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load scan summary";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}