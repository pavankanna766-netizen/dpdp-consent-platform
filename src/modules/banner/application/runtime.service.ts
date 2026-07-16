import {
  bannerService,
} from "./banner.service";

export class BannerRuntimeService {
  async getConfiguration(
    token: string
  ) {
    const {
      data,
      error,
    } =
      await bannerService.getByEmbedToken(
        token
      );

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    const primaryColor = typeof data.primary_color === "string" && /^#[0-9a-fA-F]{6}$/.test(data.primary_color)
      ? data.primary_color
      : "#111827";

    return {
      theme: data.theme === "dark" ? "dark" : "light",

      layout:
        data.layout,

      position: ["top", "bottom", "floating"].includes(data.position) ? data.position : "bottom",

      primaryColor,

      language: typeof data.language === "string" ? data.language.slice(0, 16) : "en",

      showReject: data.show_reject === true,

      showPreferences: data.show_preferences === true,

      version:
        data.version,
    };
  }
}

export const bannerRuntimeService =
  new BannerRuntimeService();
