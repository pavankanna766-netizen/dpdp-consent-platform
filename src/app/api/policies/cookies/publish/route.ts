import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureCompany } from "@/services/company.service";
import { cookiePolicyDocumentService } from "@/modules/policies";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const company = await ensureCompany(userId, "My Company");
    const result = await cookiePolicyDocumentService.publish(company.id, id);

    return NextResponse.json(result.data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to publish policy";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}