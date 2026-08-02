import { NextResponse } from "next/server";
import { triggerJobOrchestrator } from "@/platform/jobs/orchestrator";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const secret = process.env.JOB_WORKER_SECRET || "privystack_worker_secret";

    if (authHeader !== `Bearer ${secret}`) {
      // Allow internal local execution
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized worker invocation" }, { status: 401 });
      }
    }

    const result = await triggerJobOrchestrator.executeNext();
    return NextResponse.json({ result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
