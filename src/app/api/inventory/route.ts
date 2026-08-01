import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import {
  listInventoryItems,
  createInventoryItem,
} from "@/repositories/inventory.repository";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await ensureCompany(userId, "My Company");
    const { data: items, error } = await listInventoryItems(company.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: items || [] });
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

    const { data: item, error } = await createInventoryItem({
      company_id: company.id,
      category: body.category || "Uncategorized",
      processing_activity: body.processing_activity || "Web Browsing",
      data_subject: body.data_subject || "Website Visitors",
      purpose: body.purpose || "Web Analytics",
      data_types: body.data_types || ["IP Address"],
      shared_with_processor: body.shared_with_processor,
      legal_basis: body.legal_basis || "Consent (Section 6)",
      retention_period: body.retention_period || "Until withdrawn",
      storage_location: body.storage_location || "AWS ap-south-1 (Mumbai)",
      cross_border_transfer: body.cross_border_transfer ?? false,
      transfer_countries: body.transfer_countries || [],
      encryption_status: body.encryption_status || "AES-256 / TLS 1.3",
      owner_email: body.owner_email,
      status: "active",
      ai_classification_confidence: body.ai_classification_confidence || 0.95,
      unconfirmed: body.unconfirmed ?? false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
