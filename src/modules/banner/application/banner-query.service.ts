import {
  bannerService,
} from "./banner.service";

export class BannerQueryService {
  async listForCompany(
    companyId: string
  ) {
    const { data, error } =
      await bannerService.list(
        companyId
      );

    if (error) {
      throw error;
    }

    return data ?? [];
  }
}

export const bannerQueryService =
  new BannerQueryService();