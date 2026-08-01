import type { BuiltInTheme } from "@/repositories/branding.repository";

export interface ThemePreset {
  name: BuiltInTheme;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  description: string;
}

export const THEME_PRESETS: Record<BuiltInTheme, ThemePreset> = {
  Professional: {
    name: "Professional",
    primaryColor: "#4f46e5",
    secondaryColor: "#0f172a",
    accentColor: "#10b981",
    fontFamily: "Inter",
    description: "Balanced indigo & slate design for legal compliance notices.",
  },
  Modern: {
    name: "Modern",
    primaryColor: "#0284c7",
    secondaryColor: "#1e293b",
    accentColor: "#f59e0b",
    fontFamily: "Inter",
    description: "Sleek sky blue palette for tech platforms.",
  },
  Corporate: {
    name: "Corporate",
    primaryColor: "#1e3a8a",
    secondaryColor: "#172554",
    accentColor: "#2563eb",
    fontFamily: "Roboto",
    description: "Authoritative deep navy theme for enterprise disclosures.",
  },
  Minimal: {
    name: "Minimal",
    primaryColor: "#18181b",
    secondaryColor: "#27272a",
    accentColor: "#71717a",
    fontFamily: "Geist",
    description: "High-contrast monochrome theme focused on typography.",
  },
  Government: {
    name: "Government",
    primaryColor: "#14532d",
    secondaryColor: "#052e16",
    accentColor: "#ca8a04",
    fontFamily: "Merriweather",
    description: "Statutory green & gold theme for official DPDP filings.",
  },
  Startup: {
    name: "Startup",
    primaryColor: "#7c3aed",
    secondaryColor: "#4c1d95",
    accentColor: "#ec4899",
    fontFamily: "Outfit",
    description: "Vibrant violet & pink theme for fast-growing SaaS startups.",
  },
  Enterprise: {
    name: "Enterprise",
    primaryColor: "#0f172a",
    secondaryColor: "#334155",
    accentColor: "#06b6d4",
    fontFamily: "Inter",
    description: "Executive slate & cyan theme for Fortune 500 portals.",
  },
  Healthcare: {
    name: "Healthcare",
    primaryColor: "#0d9488",
    secondaryColor: "#134e4a",
    accentColor: "#06b6d4",
    fontFamily: "Roboto",
    description: "Clinical teal theme for healthtech & hospital networks.",
  },
  FinTech: {
    name: "FinTech",
    primaryColor: "#059669",
    secondaryColor: "#064e3b",
    accentColor: "#10b981",
    fontFamily: "Inter",
    description: "Trustworthy emerald green theme for banking & payment apps.",
  },
  EdTech: {
    name: "EdTech",
    primaryColor: "#ea580c",
    secondaryColor: "#7c2d12",
    accentColor: "#f97316",
    fontFamily: "Outfit",
    description: "Engaging warm orange theme for educational institutions.",
  },
  Custom: {
    name: "Custom",
    primaryColor: "#4f46e5",
    secondaryColor: "#0f172a",
    accentColor: "#10b981",
    fontFamily: "Inter",
    description: "Custom user-defined brand styling.",
  },
};

export class ThemeService {
  getPreset(theme: BuiltInTheme): ThemePreset {
    return THEME_PRESETS[theme] || THEME_PRESETS.Professional;
  }

  listPresets(): ThemePreset[] {
    return Object.values(THEME_PRESETS);
  }
}

export const themeService = new ThemeService();
