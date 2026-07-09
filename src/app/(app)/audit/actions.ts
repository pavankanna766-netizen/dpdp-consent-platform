"use server";

import { auth } from "@clerk/nextjs/server";

import { withPlatform } from "@/platform/action";
import { UnauthorizedError } from "@/platform/errors";

import { ensureCompany } from "@/services/company.service";

import { exportAuditLogs } from "@/services/audit.service";

export async function exportAuditLogsAction() {
  return withPlatform(async () => {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const company = await ensureCompany(
      userId,
      "My Company"
    );

    return exportAuditLogs(company.id);
  });
}