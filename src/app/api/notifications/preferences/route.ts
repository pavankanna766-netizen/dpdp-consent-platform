import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import { getNotificationPreferences, updateNotificationPreferences } from "@/repositories/notification.repository";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await ensureCompany(userId, "My Company");
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || "user@company.com";

    const { data: prefs, error } = await getNotificationPreferences(company.id, email);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ preferences: prefs });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await ensureCompany(userId, "My Company");
    const body = await request.json();

    const { data: prefs, error } = await updateNotificationPreferences(
      company.id,
      body.email || "user@company.com",
      body.preferences || {}
    );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ preferences: prefs });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
