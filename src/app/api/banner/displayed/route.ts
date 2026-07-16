import { NextRequest } from "next/server";
import { z, ZodError } from "zod";

import { bannerConsentService, limitPublicBannerRequest, publicBannerHeaders, publicBannerOptions, withPublicBannerHeaders } from "@/modules/banner";
import { handleHttpError } from "@/platform/http/error-handler";
import { successResponse, validationErrorResponse } from "@/platform/http/response";

const displaySchema = z.object({
  bannerToken: z.string().uuid(),
  visitorId: z.string().startsWith("ps_v_").max(128),
});

export async function POST(request: NextRequest) {
  try {
    await limitPublicBannerRequest(request, 60);
    const body = displaySchema.parse(await request.json());
    await bannerConsentService.displayed(body.bannerToken, body.visitorId, {
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: request.headers.get("user-agent")?.slice(0, 512),
    });
    return successResponse({ recorded: true }, 201, { headers: publicBannerHeaders({ "Cache-Control": "no-store" }) });
  } catch (error) {
    if (error instanceof ZodError) {
      return withPublicBannerHeaders(validationErrorResponse("Invalid banner display event.", error.issues));
    }
    return withPublicBannerHeaders(handleHttpError(error));
  }
}

export function OPTIONS() { return publicBannerOptions(); }
