import { NextRequest } from "next/server";

import { handleHttpError } from "@/platform/http/error-handler";

import {
  getPublishedTemplate,
} from "@/services/consent-template.service";

import {
  successResponse,
  internalServerErrorResponse,
} from "@/platform/http/response";

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
    const { token } =
      await params;

    const template =
      await getPublishedTemplate(
        token
      );

    if (!template) {
      return Response.json(
        {
          success: false,
          message:
            "Template not found.",
        },
        {
          status: 404,
        }
      );
    }

    return successResponse({
  title: template.title,

  consentText:
    template.consent_text,

  version: template.version,

  purposes: [
    template.purpose,
  ],

  required:
    template.is_required,
});
  } catch (error) {
  return handleHttpError(error);
}
}