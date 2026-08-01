import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import {
  listVendors,
  createVendor,
  autoCreateVendorFromScanner,
} from "@/repositories/vendor.repository";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await ensureCompany(userId, "My Company");
    const { data: vendors, error } = await listVendors(company.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ vendors: vendors || [] });
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

    if (body.fromScanner) {
      const vendor = await autoCreateVendorFromScanner(
        company.id,
        body.name || "Unknown Tracker Vendor",
        body.category || "Analytics",
        body.detectedDataTypes || ["IP Address"]
      );
      return NextResponse.json({ vendor });
    }

    const { data: vendor, error } = await createVendor({
      company_id: company.id,
      name: body.name || "New Vendor",
      category: body.category || "Analytics & Marketing",
      purpose: body.purpose || "Data Processing",
      data_categories: body.data_categories || ["Technical Data"],
      data_received: body.data_received || ["IP Address"],
      dpa_uploaded: body.dpa_uploaded ?? false,
      dpa_url: body.dpa_url,
      dpa_expiry: body.dpa_expiry,
      country: body.country || "United States",
      scc_required: body.scc_required ?? false,
      security_rating: body.security_rating || "A",
      status: "active",
      unconfirmed: false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ vendor });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
