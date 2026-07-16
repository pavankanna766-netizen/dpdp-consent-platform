import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  ensureCompany,
} from "@/services/company.service";

import {
  cookiePolicyDocumentService,
} from "@/modules/policies";

export async function POST(
  request: Request
) {
  const { userId } =
    await auth();

  if (!userId) {
    return NextResponse.json(
      {
        error:
          "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const {
    scanId,
  } =
    await request.json();

  const company =
    await ensureCompany(
      userId,
      "My Company"
    );

  const result =
    await cookiePolicyDocumentService.generate(
      scanId,
      {
        id: company.id,
        name:
          company.company_name,
        website:
          company.website ??
          "",
      }
    );

  return NextResponse.json(
    result.data
  );
}