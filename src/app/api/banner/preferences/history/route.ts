import { NextRequest } from "next/server";
import { z, ZodError } from "zod";

import { bannerConsentService, limitPublicBannerRequest, publicBannerHeaders, publicBannerOptions, withPublicBannerHeaders } from "@/modules/banner";
import { handleHttpError } from "@/platform/http/error-handler";
import { successResponse, validationErrorResponse } from "@/platform/http/response";

const querySchema = z.object({
  bannerToken: z.string().uuid(),
  visitorId: z.string().startsWith("ps_v_").max(128),
});

export async function GET(request: NextRequest) {
  try {
    await limitPublicBannerRequest(request, 60);
    const query = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    return successResponse(await bannerConsentService.history(query.bannerToken, query.visitorId), 200, { headers: publicBannerHeaders({ "Cache-Control": "no-store" }) });
  } catch (error) {
    if (error instanceof ZodError) {
      return withPublicBannerHeaders(validationErrorResponse("Invalid preference history request.", error.issues));
    }
    return withPublicBannerHeaders(handleHttpError(error));
  }
}

export function OPTIONS() { return publicBannerOptions(); }
