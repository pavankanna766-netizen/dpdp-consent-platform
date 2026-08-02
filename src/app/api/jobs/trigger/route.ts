import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import { triggerJobOrchestrator } from "@/platform/jobs/orchestrator";
import type { JobType } from "@/repositories/job-queue.repository";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await ensureCompany(userId, "My Company");
    const body = await request.json();

    if (!body.jobType) {
      return NextResponse.json({ error: "jobType is required" }, { status: 400 });
    }

    const { data: job, error } = await triggerJobOrchestrator.trigger({
      companyId: company.id,
      jobType: body.jobType as JobType,
      payload: body.payload || {},
      idempotencyKey: body.idempotencyKey,
      correlationId: body.correlationId,
      concurrencyKey: body.concurrencyKey,
      delaySeconds: body.delaySeconds,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ job });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
