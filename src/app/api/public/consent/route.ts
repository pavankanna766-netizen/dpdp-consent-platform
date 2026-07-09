import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { executePipeline } from "@/platform/http/pipeline";

import { submitPublicConsent } from "@/services/public-consent.service";
import { ConsentRequestSchema } from "@/platform/contracts";

import {
  successResponse,
  validationErrorResponse,
  internalServerErrorResponse,
} from "@/platform/http/response";

import {
  rateLimitMiddleware,
} from "@/platform/http/middleware";

export async function POST(
  request: NextRequest
) {
  try {
    const json = await request.json();

    // Validate request body at the boundary
    const body =
      ConsentRequestSchema.parse(json);

    return executePipeline({
      request,

      body,

      middlewares: [
        rateLimitMiddleware(
          60,
          60_000
        ),
      ],

      handler: async ({ body }) => {
        const consent =
          await submitPublicConsent(body);

        return successResponse({
          consentId: consent.id,
        });
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(
        "Invalid consent request.",
        error.issues
      );
    }

    console.error(error);

    return internalServerErrorResponse();
  }
}