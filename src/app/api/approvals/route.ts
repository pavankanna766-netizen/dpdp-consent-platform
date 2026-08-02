import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import { approvalService } from "@/services/approval.service";
import { legalDocumentService } from "@/services/legal-document.service";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await ensureCompany(userId, "My Company");
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    const details = await approvalService.getWorkflowStatus(company.id, documentId);
    return NextResponse.json(details || {});
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

    if (body.action === "submit_review") {
      const data = await approvalService.initializeApprovalWorkflow(company.id, body.documentId, userId);
      return NextResponse.json({ approval: data });
    }

    if (body.action === "sign") {
      const data = await approvalService.signDocument({
        companyId: company.id,
        documentId: body.documentId,
        signerName: body.signerName,
        signerEmail: body.signerEmail,
        signerRole: body.signerRole || "Legal Counsel",
        signatureType: body.signatureType || "typed",
      });
      return NextResponse.json({ signature: data });
    }

    if (body.action === "publish") {
      const data = await legalDocumentService.publishDocument(company.id, body.documentId);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
