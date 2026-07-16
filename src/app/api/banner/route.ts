import { auth } from "@clerk/nextjs/server";
import { ZodError, z } from "zod";

import {
  ensureCompanyOwner,
} from "@/services/company.service";

import {
  bannerService,
} from "@/modules/banner";
import { handleHttpError } from "@/platform/http/error-handler";
import { successResponse, validationErrorResponse } from "@/platform/http/response";

const createBannerSchema = z.object({ name: z.string().trim().min(1).max(120) });

export async function POST(
  request: Request
) {
  try {
    const { userId } = await auth();

    if (!userId) return new Response("Unauthorized", { status: 401 });

    const body = createBannerSchema.parse(await request.json());

  const company =
    await ensureCompanyOwner(
      userId,
      "My Company"
    );

  const result =
    await bannerService.create(
      company.id,
      body.name
    );

    return successResponse(result.data, 201);
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse("Invalid banner request.", error.issues);
    return handleHttpError(error);
  }
}
