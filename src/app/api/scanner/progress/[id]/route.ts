import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { summaryService } from "@/modules/scanner";
import { ensureCompany } from "@/services/company.service";
import { UnauthorizedError } from "@/platform/errors";
import { handleHttpError } from "@/platform/http/error-handler";
import { successResponse } from "@/platform/http/response";

const ScanIdSchema = z.string().uuid("Invalid scan identifier.");

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const { id } = await params;
    const scanId = ScanIdSchema.parse(id);

    // Verify company ownership (ensures authenticated user has a company)
    const company = await ensureCompany(userId, "My Company");

    const progress =
      await summaryService.progress(
        company.id,
        scanId
      );

    return successResponse(progress);
  } catch (error) {
    return handleHttpError(error);
  }
}