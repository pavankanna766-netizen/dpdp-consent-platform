import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { ensureCompany } from "@/services/company.service";
import { cookiePolicyDocumentService } from "@/modules/policies";
import { handleHttpError } from "@/platform/http/error-handler";
import { successResponse } from "@/platform/http/response";
import { UnauthorizedError } from "@/platform/errors";

const GenerateSchema = z.object({
  scanId: z.string().uuid(),
});

export async function POST(
  request: Request
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new UnauthorizedError();

    const body = GenerateSchema.parse(
      await request.json()
    );

    const company = await ensureCompany(
      userId,
      "My Company"
    );

    const result =
      await cookiePolicyDocumentService.generate(
        body.scanId,
        {
          id: company.id,
          name: company.company_name,
          website: company.website ?? "",
        }
      );

    return successResponse(result.data);
  } catch (error) {
    return handleHttpError(error);
  }
}