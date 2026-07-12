import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { ensureCompany } from "@/services/company.service";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const company = await ensureCompany(
    userId,
    "My Company"
  );

  return NextResponse.json(company);
}