"use server";

import { withPlatform } from "@/platform/action";
import { auth } from "@clerk/nextjs/server";
import { UnauthorizedError } from "@/platform/errors";
import { ensureCompany } from "@/services/company.service";
import { createBreachIncident, updateBreachIncidentNotification } from "@/repositories/breach.repository";

export async function createBreachIncidentAction(values: {
  breach_type: string;
  affected_users: number;
  data_categories: string;
  description: string;
  detected_at: string;
}) {
  return withPlatform(async () => {
    const { userId } = await auth();
    if (!userId) throw new UnauthorizedError();
    const company = await ensureCompany(userId, "My Company");

    const detectTime = new Date(values.detected_at).getTime();
    const certinDeadline = new Date(detectTime + 6 * 60 * 60 * 1000).toISOString();
    const dpbiDeadline = new Date(detectTime + 72 * 60 * 60 * 1000).toISOString();

    await createBreachIncident({
      company_id: company.id,
      breach_type: values.breach_type,
      affected_users: values.affected_users,
      data_categories: values.data_categories,
      description: values.description,
      certin_deadline: certinDeadline,
      dpbi_deadline: dpbiDeadline,
    });

    return { success: true };
  });
}

export async function markNotifiedAction(
  id: string,
  target: "certin" | "dpbi"
) {
  return withPlatform(async () => {
    const { userId } = await auth();
    if (!userId) throw new UnauthorizedError();
    const company = await ensureCompany(userId, "My Company");

    const values = target === "certin"
      ? { certin_notified_at: new Date().toISOString() }
      : { dpbi_notified_at: new Date().toISOString() };

    await updateBreachIncidentNotification(company.id, id, values);

    return { success: true };
  });
}
