import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import { summaryService } from "@/modules/scanner";
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

    const latest =
      await summaryService.latest(
        company.id
      );

    return successResponse(latest.data);
  } catch (error) {
    return handleHttpError(error);
  }
}