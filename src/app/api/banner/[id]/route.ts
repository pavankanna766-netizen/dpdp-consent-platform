import { auth } from "@clerk/nextjs/server";
import { z, ZodError } from "zod";

import { bannerService } from "@/modules/banner";
import { handleHttpError } from "@/platform/http/error-handler";
import { successResponse, validationErrorResponse } from "@/platform/http/response";
import { ensureCompanyOwner } from "@/services/company.service";

const idSchema = z.string().uuid();
const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  position: z.enum(["top", "bottom", "floating"]).optional(),
  theme: z.enum(["light", "dark"]).optional(),
  layout: z.enum(["classic", "modern", "minimal"]).optional(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  language: z.string().min(2).max(16).optional(),
  show_logo: z.boolean().optional(),
  show_reject: z.boolean().optional(),
  show_preferences: z.boolean().optional(),
  consent_expiry_days: z.number().int().min(1).max(730).optional(),
}).strict();

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });
    const id = idSchema.parse((await params).id);
    const values = updateSchema.parse(await request.json());
    const company = await ensureCompanyOwner(userId, "My Company");
    const result = await bannerService.update(company.id, id, values);
    return successResponse(result.data);
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse("Invalid banner update.", error.issues);
    return handleHttpError(error);
  }
}

export async function POST(_request: Request, { params }: Context) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });
    const id = idSchema.parse((await params).id);
    const company = await ensureCompanyOwner(userId, "My Company");
    const result = await bannerService.publish(company.id, id);
    return successResponse(result.data);
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse("Invalid banner identifier.", error.issues);
    return handleHttpError(error);
  }
}
