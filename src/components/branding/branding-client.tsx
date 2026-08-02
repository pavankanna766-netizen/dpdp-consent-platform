"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  RotateCcw,
  Check,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { THEME_PRESETS } from "@/services/theme.service";
import { updateBrandingAction, applyThemePresetAction, resetBrandingAction } from "@/app/actions/branding";
import type { CompanyBrandingRecord, BuiltInTheme } from "@/repositories/branding.repository";

interface Props {
  initialBranding: CompanyBrandingRecord;
  companyName: string;
}

export function BrandingClient({ initialBranding, companyName }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [branding, setBranding] = useState<CompanyBrandingRecord>(initialBranding);
  const [activeTab, setActiveTab] = useState<"themes" | "colors" | "header" | "watermark" | "contact">("themes");

  const handleApplyPreset = (themeName: BuiltInTheme) => {
    startTransition(async () => {
      const updated = await applyThemePresetAction(themeName);
      if (updated) setBranding(updated);
      router.refresh();
    });
  };

  const handleUpdate = (updates: Partial<CompanyBrandingRecord>) => {
    const newBranding = { ...branding, ...updates };
    setBranding(newBranding);
    startTransition(async () => {
      await updateBrandingAction(updates);
      router.refresh();
    });
  };

  const handleReset = () => {
    startTransition(async () => {
      const reset = await resetBrandingAction();
      if (reset) setBranding(reset);
      router.refresh();
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Palette className="h-8 w-8 text-indigo-600" /> Enterprise Branding & Theme Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure company-wide brand colors, logos, headers, footers, and watermarks inherited by all statutory legal disclosures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleReset} disabled={isPending} className="text-xs">
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset Defaults
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b pb-2">
            {[
              { id: "themes", label: "Preset Themes" },
              { id: "colors", label: "Colors & Typography" },
              { id: "header", label: "Header & Footer" },
              { id: "watermark", label: "Watermark & Cover" },
              { id: "contact", label: "Company Info" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: Preset Themes */}
          {activeTab === "themes" && (
            <div className="grid grid-cols-2 gap-4">
              {Object.values(THEME_PRESETS).map((preset) => {
                const isSelected = branding.theme_name === preset.name;
                return (
                  <div
                    key={preset.name}
                    onClick={() => handleApplyPreset(preset.name)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md ${
                      isSelected ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20" : "bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{preset.name}</h4>
                      {isSelected && <Check className="h-4 w-4 text-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{preset.description}</p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <span className="h-4 w-4 rounded-full border shadow-2xs" style={{ backgroundColor: preset.primaryColor }} />
                      <span className="h-4 w-4 rounded-full border shadow-2xs" style={{ backgroundColor: preset.secondaryColor }} />
                      <span className="h-4 w-4 rounded-full border shadow-2xs" style={{ backgroundColor: preset.accentColor }} />
                      <span className="text-[10px] font-mono text-slate-400 ml-auto">{preset.fontFamily}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: Colors & Typography */}
          {activeTab === "colors" && (
            <div className="rounded-xl border bg-white p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Primary Color</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <input
                      type="color"
                      value={branding.primary_color}
                      onChange={(e) => handleUpdate({ primary_color: e.target.value, theme_name: "Custom" })}
                      className="h-8 w-12 rounded cursor-pointer border p-0.5"
                    />
                    <Input
                      value={branding.primary_color}
                      onChange={(e) => handleUpdate({ primary_color: e.target.value, theme_name: "Custom" })}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Secondary Color</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <input
                      type="color"
                      value={branding.secondary_color}
                      onChange={(e) => handleUpdate({ secondary_color: e.target.value, theme_name: "Custom" })}
                      className="h-8 w-12 rounded cursor-pointer border p-0.5"
                    />
                    <Input
                      value={branding.secondary_color}
                      onChange={(e) => handleUpdate({ secondary_color: e.target.value, theme_name: "Custom" })}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Accent Color</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <input
                      type="color"
                      value={branding.accent_color}
                      onChange={(e) => handleUpdate({ accent_color: e.target.value, theme_name: "Custom" })}
                      className="h-8 w-12 rounded cursor-pointer border p-0.5"
                    />
                    <Input
                      value={branding.accent_color}
                      onChange={(e) => handleUpdate({ accent_color: e.target.value, theme_name: "Custom" })}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label className="text-xs">Font Family</Label>
                <select
                  value={branding.font_family}
                  onChange={(e) => handleUpdate({ font_family: e.target.value, theme_name: "Custom" })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-slate-800"
                >
                  <option value="Inter">Inter (Sans-serif Modern)</option>
                  <option value="Roboto">Roboto (Clean Corporate)</option>
                  <option value="Outfit">Outfit (Geometric Tech)</option>
                  <option value="Geist">Geist (High Contrast Minimal)</option>
                  <option value="Merriweather">Merriweather (Statutory Serif)</option>
                </select>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label className="text-xs">Logo Image URL</Label>
                <Input
                  placeholder="https://company.com/logo.png"
                  value={branding.logo_url || ""}
                  onChange={(e) => handleUpdate({ logo_url: e.target.value || null })}
                  className="text-xs h-8"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Header & Footer */}
          {activeTab === "header" && (
            <div className="rounded-xl border bg-white p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Document Header</h4>
                  <p className="text-xs text-slate-500">Show company logo & version badge at the top of documents.</p>
                </div>
                <input
                  type="checkbox"
                  checked={branding.header_enabled}
                  onChange={(e) => handleUpdate({ header_enabled: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 rounded"
                />
              </div>

              <div className="border-t pt-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Document Footer</h4>
                  <p className="text-xs text-slate-500">Show statutory compliance disclosures & page numbers.</p>
                </div>
                <input
                  type="checkbox"
                  checked={branding.footer_enabled}
                  onChange={(e) => handleUpdate({ footer_enabled: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 rounded"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Watermark & Cover */}
          {activeTab === "watermark" && (
            <div className="rounded-xl border bg-white p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Document Watermark</h4>
                  <p className="text-xs text-slate-500">Overlay subtle watermark text across document pages.</p>
                </div>
                <input
                  type="checkbox"
                  checked={branding.watermark_enabled}
                  onChange={(e) => handleUpdate({ watermark_enabled: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Standalone Cover Page</h4>
                  <p className="text-xs text-slate-500">Prepend a title cover page for executive legal exports.</p>
                </div>
                <input
                  type="checkbox"
                  checked={branding.cover_page_enabled}
                  onChange={(e) => handleUpdate({ cover_page_enabled: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 rounded"
                />
              </div>
            </div>
          )}

          {/* TAB 5: Company Info */}
          {activeTab === "contact" && (
            <div className="rounded-xl border bg-white p-6 space-y-4">
              <div>
                <Label className="text-xs">Registered Address</Label>
                <Input
                  placeholder="Mumbai, Maharashtra, India"
                  value={branding.address || ""}
                  onChange={(e) => handleUpdate({ address: e.target.value || null })}
                  className="text-xs h-8 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Support Email</Label>
                  <Input
                    placeholder="support@company.com"
                    value={branding.support_email || ""}
                    onChange={(e) => handleUpdate({ support_email: e.target.value || null })}
                    className="text-xs h-8 mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">DPO / Privacy Contact</Label>
                  <Input
                    placeholder="privacy@company.com"
                    value={branding.privacy_contact || ""}
                    onChange={(e) => handleUpdate({ privacy_contact: e.target.value || null })}
                    className="text-xs h-8 mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Real-Time Live Preview */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-indigo-600" /> Real-Time Document Preview
            </span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold">🟢 Live Synchronized</span>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm min-h-[500px] flex flex-col justify-between font-sans relative overflow-hidden" style={{ fontFamily: branding.font_family }}>
            {branding.watermark_enabled && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-5xl font-black uppercase tracking-widest"
                style={{
                  color: branding.primary_color,
                  opacity: 0.12,
                  transform: "rotate(-35deg)",
                }}
              >
                DRAFT
              </div>
            )}

            <div>
              {branding.header_enabled && (
                <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: branding.primary_color }}>
                  <span className="font-extrabold text-sm" style={{ color: branding.primary_color }}>{companyName}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Statutory Notice (v1.0)</span>
                </div>
              )}

              <h2 className="text-xl font-black mb-2" style={{ color: branding.primary_color }}>Statutory Privacy Notice</h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                This document outlines personal data processing activities under the Digital Personal Data Protection Act 2023 of India.
              </p>

              <div className="rounded-lg border p-3 text-xs bg-slate-50 space-y-1" style={{ borderLeftWidth: "4px", borderLeftColor: branding.accent_color }}>
                <span className="font-bold block" style={{ color: branding.secondary_color }}>Parental Consent Safeguard</span>
                <p className="text-[11px] text-slate-500">Verifiable consent required before processing data of minors under 18 years.</p>
              </div>
            </div>

            {branding.footer_enabled && (
              <div className="border-t pt-3 mt-6 flex items-center justify-between text-[10px] text-slate-400">
                <span>{companyName} • {branding.address || "India"}</span>
                <span>DPDP Act 2023 Statutory Document</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
