import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import { legalDocumentService } from "@/services/legal-document.service";
import type { LegalDocumentType } from "@/repositories/legal-document.repository";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await ensureCompany(userId, "My Company");
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as LegalDocumentType | null;

    if (type) {
      const { data: versions, error } = await legalDocumentService.listVersions(company.id, type);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ documents: versions || [] });
    }

    const { data: documents, error } = await legalDocumentService.listAll(company.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ documents: documents || [] });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await ensureCompany(userId, "My Company");
    const body = await request.json();

    if (body.action === "generate") {
      const { data: doc, error } = await legalDocumentService.generateDocument(
        company.id,
        body.type || "custom"
      );
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ document: doc });
    }

    const { data: doc, error } = await legalDocumentService.createDocument(company.id, {
      type: body.type || "custom",
      title: body.title || "Untitled Legal Document",
      slug: body.slug || "document",
      htmlContent: body.htmlContent || "",
      sections: body.sections,
      metadata: body.metadata,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ document: doc });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
