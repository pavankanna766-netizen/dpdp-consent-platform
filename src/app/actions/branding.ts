"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { UnauthorizedError } from "@/platform/errors";
import { ensureCompany } from "@/services/company.service";
import { brandingService } from "@/services/branding.service";
import type { BuiltInTheme } from "@/repositories/branding.repository";

export async function updateBrandingAction(values: {
  theme_name?: BuiltInTheme;
  logo_url?: string | null;
  dark_logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  font_family?: string;
  document_width?: string;
  document_margin?: string;
  header_enabled?: boolean;
  footer_enabled?: boolean;
  watermark_enabled?: boolean;
  watermark_config?: { text: string; opacity: number; rotation: number };
  cover_page_enabled?: boolean;
  address?: string | null;
  support_email?: string | null;
  privacy_contact?: string | null;
  dpo_name?: string | null;
  phone_number?: string | null;
}) {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  const { data, error } = await brandingService.updateBranding(company.id, values);

  if (error) throw error;

  revalidatePath("/dashboard/branding");
  revalidatePath("/dashboard/studio");
  return data;
}

export async function applyThemePresetAction(themeName: BuiltInTheme) {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  const { data, error } = await brandingService.applyThemePreset(company.id, themeName);

  if (error) throw error;

  revalidatePath("/dashboard/branding");
  revalidatePath("/dashboard/studio");
  return data;
}

export async function resetBrandingAction() {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  const { data, error } = await brandingService.resetBranding(company.id);

  if (error) throw error;

  revalidatePath("/dashboard/branding");
  revalidatePath("/dashboard/studio");
  return data;
}
