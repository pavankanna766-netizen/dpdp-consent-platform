import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureCompany } from "@/services/company.service";
import { jobService } from "@/modules/scanner";
import { getScan } from "@/repositories/scanner.repository";

export async function GET(
  request: Request,
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
    const { data: scan } = await getScan(company.id, id);

    if (!scan || scan.company_id !== company.id) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    const job = await jobService.get(company.id, id);

    if (!job) {
      return NextResponse.json({ error: "Scan job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load scan job status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}