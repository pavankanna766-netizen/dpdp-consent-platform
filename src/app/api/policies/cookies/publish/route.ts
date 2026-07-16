import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { ensureCompany } from "@/services/company.service";
import { cookiePolicyDocumentService } from "@/modules/policies";
import { handleHttpError } from "@/platform/http/error-handler";
import { successResponse } from "@/platform/http/response";
import { UnauthorizedError } from "@/platform/errors";

const PublishSchema = z.object({ id: z.string().uuid() });

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) throw new UnauthorizedError();

    const body = PublishSchema.parse(await request.json());
    const company = await ensureCompany(userId, "My Company");
    const result = await cookiePolicyDocumentService.publish(company.id, body.id);

    return successResponse(result.data);
  } catch (error) {
    return handleHttpError(error);
  }
}