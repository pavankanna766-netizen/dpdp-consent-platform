import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import { documentRendererService } from "@/services/document-renderer.service";
import type { ExportFormat } from "@/repositories/export.repository";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await ensureCompany(userId, "My Company");
    const body = await request.json();

    if (!body.documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    const format: ExportFormat = body.format || "html";

    const exportResult = await documentRendererService.renderAndExport(
      company.id,
      body.documentId,
      format,
      { name: userId, ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1" }
    );

    return new NextResponse(exportResult.content, {
      headers: {
        "Content-Type": exportResult.mimeType,
        "Content-Disposition": `attachment; filename="${exportResult.filename}"`,
        "X-Document-Hash": exportResult.documentHash,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
