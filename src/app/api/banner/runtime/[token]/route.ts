import { NextRequest } from "next/server";
import { z, ZodError } from "zod";

import { bannerRuntimeService, limitPublicBannerRequest, publicBannerHeaders, publicBannerOptions, withPublicBannerHeaders } from "@/modules/banner";
import { handleHttpError } from "@/platform/http/error-handler";
import { notFoundResponse, validationErrorResponse } from "@/platform/http/response";

const tokenSchema = z.string().uuid();

export async function GET(request: NextRequest, { params }: RouteContext<"/api/banner/runtime/[token]">) {
  try {
    await limitPublicBannerRequest(request, 120);
    const token = tokenSchema.parse((await params).token);
    const config = await bannerRuntimeService.getConfiguration(token);
    if (!config) return withPublicBannerHeaders(notFoundResponse("Banner not found"));
    return Response.json(config, { headers: publicBannerHeaders({ "Cache-Control": "public, max-age=60" }) });
  } catch (error) {
    if (error instanceof ZodError) return withPublicBannerHeaders(validationErrorResponse("Invalid banner token.", error.issues));
    return withPublicBannerHeaders(handleHttpError(error));
  }
}

export function OPTIONS() { return publicBannerOptions(); }
