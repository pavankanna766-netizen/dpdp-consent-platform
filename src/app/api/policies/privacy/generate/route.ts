import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import { privacyDocumentService } from "@/modules/policies";
import { handleHttpError } from "@/platform/http/error-handler";
import { successResponse } from "@/platform/http/response";
import { UnauthorizedError } from "@/platform/errors";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) throw new UnauthorizedError();

    const company = await ensureCompany(
      userId,
      "My Company"
    );

    const result =
      await privacyDocumentService.generate(
        company.id,
        {
          companyName:
            company.company_name,

          legalEntity:
            company.company_name,

          website:
            company.website ?? "",

          contactEmail: "",

          supportEmail: "",

          dpoEmail: "",

          address: "",

          country:
            company.country,

          lastUpdated:
            new Date().toISOString(),
        }
      );

    return successResponse(result.data);
  } catch (error) {
    return handleHttpError(error);
  }
}