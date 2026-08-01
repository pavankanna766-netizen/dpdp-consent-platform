import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import { brandingService } from "@/services/branding.service";
import { previewService } from "@/services/preview.service";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await ensureCompany(userId, "My Company");
    const body = await request.json();

    const branding = body.branding || (await brandingService.getBranding(company.id));

    const htmlPreview = previewService.generateLivePreview(
      company.company_name,
      body.title || "Statutory Document Preview",
      body.htmlContent || `<h2>Document Preview</h2><p>This is your live branded document rendering.</p>`,
      branding
    );

    return new NextResponse(htmlPreview, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
