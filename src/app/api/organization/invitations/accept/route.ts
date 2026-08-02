import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { organizationService } from "@/services/organization.service";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.token) {
      return NextResponse.json({ error: "Invitation token is required" }, { status: 400 });
    }

    const result = await organizationService.acceptInvitation(body.token, userId);
    return NextResponse.json({ success: true, companyId: result.companyId });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
