import { auth } from "@clerk/nextjs/server";

import {
  ensureCompany,
} from "@/services/company.service";

import {
  summaryService,
} from "@/modules/scanner";

export async function GET() {
  const { userId } =
    await auth();

  if (!userId) {
    return Response.json(
      {
        success: false,
      },
      {
        status: 401,
      }
    );
  }

  const company =
    await ensureCompany(
      userId,
      "My Company"
    );

  const latest =
    await summaryService.latest(
      company.id
    );

  return Response.json(
    latest.data
  );
}