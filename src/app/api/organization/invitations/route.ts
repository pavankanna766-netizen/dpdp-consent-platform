import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import { organizationService } from "@/services/organization.service";
import { checkPermission, type OrgRole } from "@/platform/permissions/rbac";
import { getUserCompanyRole } from "@/repositories/company.repository";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await ensureCompany(userId, "My Company");
    const { data: invitations, error } = await organizationService.getInvitations(company.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ invitations: invitations || [] });
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
    const userRole = (await getUserCompanyRole(company.id, userId)) as OrgRole;

    if (!checkPermission(userRole, "company.members.invite")) {
      return NextResponse.json({ error: "Forbidden: Insufficient privileges to invite members." }, { status: 403 });
    }

    const body = await request.json();
    if (!body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const invitation = await organizationService.inviteMember(
      company.id,
      body.email,
      (body.role as OrgRole) || "compliance_manager",
      userId
    );

    return NextResponse.json({ invitation });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
