import { NextResponse } from "next/server";
import { getCompanyBySlug } from "@/repositories/company-slug.repository";
import { listVendors } from "@/repositories/vendor.repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const companyRes = await getCompanyBySlug(slug);
    if (!companyRes.data) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const companyId = companyRes.data.id;
    const { data: vendors, error } = await listVendors(companyId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const publicVendors = (vendors || []).map((v) => ({
      name: v.name,
      category: v.category || "Data Processor",
      country: v.country || "United States",
      dpaStatus: v.dpa_uploaded ? "Executed DPA" : "Standard Agreement",
      sccEnforced: v.scc_required,
    }));

    return NextResponse.json({ subprocessors: publicVendors });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
