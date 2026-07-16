import { auth } from "@clerk/nextjs/server";
import { ZodError } from "zod";

import { withPlatform } from "@/platform/action";
import { ConsentIdSchema } from "@/platform/contracts";
import { UnauthorizedError } from "@/platform/errors";
import { handleHttpError } from "@/platform/http/error-handler";
import {
  successResponse,
  validationErrorResponse,
} from "@/platform/http/response";
import { ensureCompany } from "@/services/company.service";
import {
  getConsentReceipt,
  revokeConsent,
} from "@/services/consent.service";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: Context) {
  try {
    return await withPlatform(async () => {
      const { userId } = await auth();

      if (!userId) {
        throw new UnauthorizedError();
      }

      const { id } = await params;
      const consentId = ConsentIdSchema.parse(id);
      const company = await ensureCompany(userId, "My Company");
      const consent = await revokeConsent(company.id, consentId);

      return successResponse({
        consent,
        receipt: getConsentReceipt(consent),
      });
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse("Invalid consent identifier.", error.issues);
    }

    return handleHttpError(error);
  }
}
