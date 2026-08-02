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
    const { data: members, error } = await organizationService.getMembers(company.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ members: members || [] });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await ensureCompany(userId, "My Company");
    const userRole = (await getUserCompanyRole(company.id, userId)) as OrgRole;

    if (!checkPermission(userRole, "company.members.manage")) {
      return NextResponse.json({ error: "Forbidden: Requires Admin or Owner role." }, { status: 403 });
    }

    const body = await request.json();
    if (!body.memberId || !body.role) {
      return NextResponse.json({ error: "memberId and role are required" }, { status: 400 });
    }

    await organizationService.updateRole(company.id, body.memberId, body.role as OrgRole, userId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
