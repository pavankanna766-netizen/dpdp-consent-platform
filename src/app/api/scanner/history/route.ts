import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import {
  summaryService,
} from "@/modules/scanner";

import {
  findCompanyByClerkUserId,
} from "@/repositories/company.repository";

export async function GET() {
  const { userId } =
    await auth();

  if (!userId) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const result =
    await findCompanyByClerkUserId(
      userId
    );

    console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);

  if (
    result.error ||
    !result.data ||
    !result.data.companies ||
    result.data.companies.length === 0
  ) {
    return NextResponse.json(
      {
        error:
          "Company not found",
      },
      {
        status: 404,
      }
    );
  }

 const companies =
  result.data.companies;

const company =
  Array.isArray(companies)
    ? companies[0]
    : companies;

if (!company) {
  return NextResponse.json(
    {
      error: "Company not found",
    },
    {
      status: 404,
    }
  );
}

const scans =
  await summaryService.history(
    company.id
  );

  return NextResponse.json(
    scans.data ?? []
  );
}