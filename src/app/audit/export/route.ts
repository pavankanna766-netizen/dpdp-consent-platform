import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { SUPPORTED_EXPORT_FORMATS } from "@/platform/export/constants";

import { requireEnum } from "@/platform/http/validators";

import { ensureCompany } from "@/services/company.service";
import { exportAuditLogs } from "@/services/audit.service";

import { withPlatform } from "@/platform/action";

export async function GET(
  request: Request
) {
  return withPlatform(async () => {
    const { searchParams } =
    new URL(request.url);

  const rawFormat =
  searchParams.get("format");

const format =
  rawFormat === null
    ? "csv"
    : requireEnum(
  rawFormat,
  SUPPORTED_EXPORT_FORMATS,
  "format"
);
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const company = await ensureCompany(
      userId,
      "My Company"
    );

    const result =
  await exportAuditLogs(
    company.id,
    format
  );

    return new NextResponse(
      new Uint8Array(result.buffer),
      {
        headers: {
          "Content-Type": result.contentType,
          "Content-Disposition":
            `attachment; filename="${result.filename}"`,
        },
      }
    );
  });
}