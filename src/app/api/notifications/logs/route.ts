import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import { listCompanyNotificationLogs } from "@/repositories/notification.repository";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await ensureCompany(userId, "My Company");
    const { data: logs, error } = await listCompanyNotificationLogs(company.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ logs: logs || [] });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
