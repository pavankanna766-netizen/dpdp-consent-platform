import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import { handleHttpError } from "@/platform/http/error-handler";
import { successResponse } from "@/platform/http/response";
import { UnauthorizedError } from "@/platform/errors";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) throw new UnauthorizedError();

    const company = await ensureCompany(
      userId,
      "My Company"
    );

    return successResponse(company);
  } catch (error) {
    return handleHttpError(error);
  }
}