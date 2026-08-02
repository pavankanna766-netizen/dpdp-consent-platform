import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import { notificationPlatformService } from "@/services/notification-platform.service";
import type { DomainEventType } from "@/platform/notifications/event-bus";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await ensureCompany(userId, "My Company");
    const body = await request.json();

    if (!body.eventType || !body.recipientEmail || !body.title) {
      return NextResponse.json({ error: "eventType, recipientEmail, and title are required" }, { status: 400 });
    }

    await notificationPlatformService.publishDomainEvent({
      companyId: company.id,
      eventType: body.eventType as DomainEventType,
      recipientEmail: body.recipientEmail,
      title: body.title,
      metadata: body.metadata || {},
    });

    return NextResponse.json({ success: true, message: "Domain event published to Notification Platform." });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
