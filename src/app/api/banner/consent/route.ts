import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { bannerConsentService, BannerConsentRequestSchema, limitPublicBannerRequest, publicBannerHeaders, publicBannerOptions, withPublicBannerHeaders } from "@/modules/banner";
import { handleHttpError } from "@/platform/http/error-handler";
import { successResponse, validationErrorResponse } from "@/platform/http/response";

export async function POST(request: NextRequest) {
  try {
    await limitPublicBannerRequest(request, 30);
    const body = BannerConsentRequestSchema.parse(await request.json());
    const origin = request.headers.get("origin");
    if (origin && body.pageUrl && new URL(origin).origin !== new URL(body.pageUrl).origin) {
      return withPublicBannerHeaders(validationErrorResponse("The request origin does not match the page URL."));
    }
    const preference = await bannerConsentService.record(body, {
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: request.headers.get("user-agent")?.slice(0, 512),
    });

    return successResponse(preference, 201, {
      headers: publicBannerHeaders({
        "Cache-Control": "no-store",
      }),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return withPublicBannerHeaders(validationErrorResponse("Invalid banner consent request.", error.issues));
    }
    return withPublicBannerHeaders(handleHttpError(error));
  }
}

export function OPTIONS() { return publicBannerOptions(); }
