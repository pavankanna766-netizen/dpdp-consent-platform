import {
  createTrustCenter,
  getTrustCenter,
} from "@/repositories/trust-center.repository";

export class TrustCenterService {
  async ensure(
    companyId: string
  ) {
    const {
      data,
    } =
      await getTrustCenter(
        companyId
      );

    if (data) {
      return data;
    }

    const {
      data: created,
    } =
      await createTrustCenter(
        companyId
      );

    return created;
  }
}

export const trustCenterService =
  new TrustCenterService();