import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  ensureCompany,
} from "@/services/company.service";

import {
  privacyDocumentService,
} from "@/modules/policies";

export async function POST() {
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
    await privacyDocumentService.generate(
      company.id,
      {
        companyName:
          company.company_name,

        legalEntity:
          company.company_name,

        website:
          company.website ?? "",

        contactEmail: "",

        supportEmail: "",

        dpoEmail: "",

        address: "",

        country:
          company.country,

        lastUpdated:
          new Date().toISOString(),
      }
    );

  return NextResponse.json(
    result.data
  );
}