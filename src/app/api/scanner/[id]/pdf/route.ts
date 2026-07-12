export const runtime = "nodejs";
import { NextResponse } from "next/server";
import {
  pdfService,
} from "@/modules/report";

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
  const { id } = await params;

  const buffer =
    await pdfService.generate(id);

 return new NextResponse(
  new Uint8Array(buffer),
  {
    headers: {
      "Content-Type":
        "application/pdf",

      "Content-Disposition":
        'attachment; filename="PrivyStack-Privacy-Report.pdf"',

      "Cache-Control":
        "no-store",
    },
  }
);
}