import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import { webhookService } from "@/services/webhook.service";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await ensureCompany(userId, "My Company");

    await webhookService.dispatchEvent(company.id, "scanner.completed", {
      event: "scanner.completed",
      test: true,
      timestamp: new Date().toISOString(),
      companyId: company.id,
      summary: {
        overall_score: 98,
        total_cookies: 12,
        unclassified_cookies: 0,
      },
    });

    return NextResponse.json({ success: true, message: "Test webhook payload dispatched to active endpoints." });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
