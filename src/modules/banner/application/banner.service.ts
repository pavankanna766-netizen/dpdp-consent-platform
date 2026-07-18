import {
  createBanner,
  getBanner,
  getCompanyBanner,
  listCompanyBanners,
  updateBanner,
  getBannerByEmbedToken,
} from "@/repositories/banner.repository";

import crypto from "crypto";
import { NotFoundError } from "@/platform/errors";
import { ensurePlatformInitialized } from "@/platform/init";
import { publishEvent, PlatformEvents } from "@/platform/events";

export class BannerService {
  async create(
    companyId: string,
    name: string
  ) {
    const result = await createBanner({
      company_id: companyId,
      name,
    });
    if (result.error) throw result.error;
    ensurePlatformInitialized();
    await publishEvent(PlatformEvents.BANNER_CREATED, { companyId, bannerId: result.data.id });
    return result;
  }

  get(
    companyId: string,
    id: string
  ) {
    return getBanner(companyId, id);
  }

  getForCompany(companyId: string, id: string) {
    return getCompanyBanner(companyId, id);
  }
  list(
    companyId: string
  ) {
    return listCompanyBanners(
      companyId
    );
  }

  getByEmbedToken(
  token: string
) {
  return getBannerByEmbedToken(
    token
  );
}

  async publish(
    companyId: string,
    id: string
  ) {
    const { data: banner, error } = await getCompanyBanner(companyId, id);
    if (error) throw error;
    if (!banner) throw new NotFoundError("Cookie banner");
    const result = await updateBanner(companyId, id, {
      status: "published",
      embed_token: banner.embed_token ?? crypto.randomUUID(),
      published_at:
        new Date().toISOString(),
      version: banner.version + 1,
    });
    if (result.error) throw result.error;
    ensurePlatformInitialized();
    await publishEvent(PlatformEvents.BANNER_PUBLISHED, { companyId, bannerId: id, version: result.data.version });
    return result;
  }

  async update(
    companyId: string,
    id: string,
    values: Record<
      string,
      unknown
    >
  ) {
    const { data: banner, error } = await getCompanyBanner(companyId, id);
    if (error) throw error;
    if (!banner) throw new NotFoundError("Cookie banner");
    const result = await updateBanner(
      companyId,
      id,
      values
    );
    if (result.error) throw result.error;
    ensurePlatformInitialized();
    await publishEvent(PlatformEvents.BANNER_UPDATED, { companyId, bannerId: id });
    return result;
  }
}

export const bannerService =
  new BannerService();
