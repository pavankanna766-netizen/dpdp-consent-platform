import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { variableService } from "@/services/variable.service";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const variables = variableService.listAvailable();
    return NextResponse.json({ variables });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
