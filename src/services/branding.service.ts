import {
  getCompanyBranding,
  updateCompanyBranding,
  resetCompanyBranding,
  type BuiltInTheme,
  type CompanyBrandingRecord,
} from "@/repositories/branding.repository";
import { themeService } from "./theme.service";

export class BrandingService {
  async getBranding(companyId: string): Promise<CompanyBrandingRecord> {
    const { data, error } = await getCompanyBranding(companyId);
    if (error || !data) {
      throw error ?? new Error("Failed to load company branding.");
    }
    return data as CompanyBrandingRecord;
  }

  async applyThemePreset(companyId: string, themeName: BuiltInTheme) {
    const preset = themeService.getPreset(themeName);
    return updateCompanyBranding(companyId, {
      theme_name: themeName,
      primary_color: preset.primaryColor,
      secondary_color: preset.secondaryColor,
      accent_color: preset.accentColor,
      font_family: preset.fontFamily,
    });
  }

  async updateBranding(
    companyId: string,
    values: Partial<Parameters<typeof updateCompanyBranding>[1]>
  ) {
    // Validate logo URLs if provided
    if (values.logo_url && !this.isValidImageUrl(values.logo_url)) {
      throw new Error("Invalid logo URL. Only HTTP/HTTPS URLs pointing to PNG, JPG, WEBP, or SVG are permitted.");
    }
    if (values.dark_logo_url && !this.isValidImageUrl(values.dark_logo_url)) {
      throw new Error("Invalid dark logo URL.");
    }

    return updateCompanyBranding(companyId, values);
  }

  async resetBranding(companyId: string) {
    return resetCompanyBranding(companyId);
  }

  private isValidImageUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) return false;
      return true;
    } catch {
      return false;
    }
  }
}

export const brandingService = new BrandingService();
