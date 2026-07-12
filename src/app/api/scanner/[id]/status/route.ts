import { NextResponse } from "next/server";

import {
  jobService,
} from "@/modules/scanner";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const { id } =
    await params;

  const job =
    await jobService.get(id);

  if (!job) {
    return NextResponse.json(
      {
        error:
          "Scan not found",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json(job);
}