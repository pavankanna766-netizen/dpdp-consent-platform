import { NextRequest } from "next/server";

import {
  summaryService,
} from "@/modules/scanner";

export async function GET(
  request: NextRequest,
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

  const summary =
    await summaryService.get(id);

  return Response.json(summary);
}