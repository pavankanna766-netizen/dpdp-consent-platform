export const runtime = "nodejs";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureCompany } from "@/services/company.service";
import { pdfService } from "@/modules/report";
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

    const buffer = await pdfService.generate(company.id, id);

    return new NextResponse(
      new Uint8Array(buffer),
      {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="PrivyStack-Privacy-Report.pdf"',
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to generate PDF report";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}