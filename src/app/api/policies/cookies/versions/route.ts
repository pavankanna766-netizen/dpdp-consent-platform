import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  ensureCompany,
} from "@/services/company.service";

import {
  cookiePolicyDocumentService,
} from "@/modules/policies";

export async function GET() {
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

  const company =
    await ensureCompany(
      userId,
      "My Company"
    );

  const result =
    await cookiePolicyDocumentService.versions(
      company.id
    );

  return NextResponse.json(
    result.data
  );
}