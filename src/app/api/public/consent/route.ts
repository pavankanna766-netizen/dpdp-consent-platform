import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { executePipeline } from "@/platform/http/pipeline";

import { submitPublicConsent } from "@/services/public-consent.service";
import { ConsentRequestSchema } from "@/platform/contracts";

import {
  successResponse,
  validationErrorResponse,
} from "@/platform/http/response";

import {
  rateLimitMiddleware,
} from "@/platform/http/middleware";

import { handleHttpError } from "@/platform/http/error-handler";
import { withPlatform } from "@/platform/action";
import {
  publicBannerOptions,
  withPublicBannerHeaders,
} from "@/modules/banner/application/public-http";

export async function OPTIONS() {
  return publicBannerOptions();
}

export async function POST(
  request: NextRequest
) {
  try {
    const json = await request.json();

    const body =
      ConsentRequestSchema.parse(json);

    const response = await withPlatform(() => executePipeline({
      request,

      body,

      middlewares: [
        rateLimitMiddleware(
          60,
          60_000
        ),
      ],

      handler: async ({ body, clientIp, request }) => {
        const result = await submitPublicConsent(body, {
          ipAddress: clientIp.split(",")[0]?.trim(),
          userAgent: request.headers
            .get("user-agent")
            ?.slice(0, 512),
        });

        return successResponse(result);
      },
    }));

    return withPublicBannerHeaders(response);
  } catch (error) {
    if (error instanceof ZodError) {
      return withPublicBannerHeaders(
        validationErrorResponse(
          "Invalid consent request.",
          error.issues
        )
      );
    }

    return withPublicBannerHeaders(
      handleHttpError(error)
    );
  }
}
