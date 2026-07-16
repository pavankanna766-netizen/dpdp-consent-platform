import { NextRequest } from "next/server";
import { z } from "zod";

import { handleHttpError } from "@/platform/http/error-handler";

import {
  getPublishedTemplate,
} from "@/services/consent-template.service";

import {
  successResponse,
} from "@/platform/http/response";

import {
  publicBannerOptions,
  withPublicBannerHeaders,
  limitPublicBannerRequest,
} from "@/modules/banner/application/public-http";

const TokenSchema = z.string().uuid("Invalid template token.");

export async function OPTIONS() {
  return publicBannerOptions();
}

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      token: string;
    }>;
  }
) {
  try {
    await limitPublicBannerRequest(request, 120);

    const { token } = await params;
    const validToken = TokenSchema.parse(token);

    const template =
      await getPublishedTemplate(
        validToken
      );

    if (!template) {
      return withPublicBannerHeaders(
        Response.json(
          {
            success: false,
            message:
              "Template not found.",
          },
          {
            status: 404,
          }
        )
      );
    }

    return withPublicBannerHeaders(
      successResponse({
        title: template.title,

        consentText:
          template.consent_text,

        version: template.version,

        purposes: [
          template.purpose,
        ],

        required:
          template.is_required,
      })
    );
  } catch (error) {
    return withPublicBannerHeaders(
      handleHttpError(error)
    );
  }
}