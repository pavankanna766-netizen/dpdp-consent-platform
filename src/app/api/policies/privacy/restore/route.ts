import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { ensureCompany } from "@/services/company.service";
import { privacyDocumentService } from "@/modules/policies";
import { handleHttpError } from "@/platform/http/error-handler";
import { successResponse } from "@/platform/http/response";
import { UnauthorizedError } from "@/platform/errors";

const RestoreSchema = z.object({ id: z.string().uuid() });

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) throw new UnauthorizedError();

    const body = RestoreSchema.parse(await request.json());
    const company = await ensureCompany(userId, "My Company");
    const result = await privacyDocumentService.restore(company.id, body.id);

    return successResponse(result.data);
  } catch (error) {
    return handleHttpError(error);
  }
}