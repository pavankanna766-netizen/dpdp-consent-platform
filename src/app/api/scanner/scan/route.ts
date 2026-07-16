import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { ensureCompany } from "@/services/company.service";
import {
  ScanOrchestrator,
  DefaultScanPipeline,
} from "@/modules/scanner";

const pipeline = new DefaultScanPipeline();
const orchestrator = new ScanOrchestrator(pipeline);

const scanRequestSchema = z.object({
  url: z
    .string()
    .trim()
    .url("Enter a valid website URL.")
    .refine(
      (value) => {
        const protocol = new URL(value).protocol;
        return protocol === "http:" || protocol === "https:";
      },
      "Only HTTP and HTTPS websites can be scanned."
    ),
});

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
    const parsedBody = scanRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return Response.json(
        {
          success: false,
          error: parsedBody.error.issues[0]?.message ?? "Invalid scan request.",
        },
        { status: 400 }
      );
    }

    const company = await ensureCompany(
      userId,
      "My Company"
    );

    const scanId =
      await orchestrator.scan({
        companyId: company.id,
        url: parsedBody.data.url,
      });

    return Response.json({
      success: true,
      scanId,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json(
        {
          success: false,
          error: "Request body must be valid JSON.",
        },
        { status: 400 }
      );
    }

    console.error("Scanner request failed", error);

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
