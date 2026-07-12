import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { ensureCompany } from "@/services/company.service";
import {
  ScanOrchestrator,
  DefaultScanPipeline,
} from "@/modules/scanner";

const pipeline = new DefaultScanPipeline();
const orchestrator = new ScanOrchestrator(pipeline);

export async function POST(
  request: NextRequest
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();
    console.log("BODY:", body);

    const company = await ensureCompany(
      userId,
      "My Company"
    );
    console.log("COMPANY:", company);

    const scanId =
      await orchestrator.scan({
        companyId: company.id,
        url: body.url,
      });

    console.log("SCAN ID:", scanId);

    return Response.json({
      success: true,
      scanId,
    });
  } catch (error) {
    console.error("SCAN ROUTE ERROR:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}