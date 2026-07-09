"use client";

import { localizationEngine } from "@/platform/localization/engine";

type BannerProps = {
  onAccept?: () => void;
  onReject?: () => void;
  onCustomize?: () => void;
};

export function ConsentBanner({
  onAccept,
  onReject,
  onCustomize,
}: BannerProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[min(720px,95vw)] -translate-x-1/2 rounded-2xl border bg-white p-6 shadow-2xl">
      <h2 className="text-xl font-semibold">
  {localizationEngine.t(
    "consent.banner.title"
  )}
</h2>

      <p className="mt-3 text-sm text-gray-600">
  {localizationEngine.t(
    "consent.banner.description"
  )}
</p>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          onClick={onReject}
          className="rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          {localizationEngine.t(
  "consent.banner.reject"
)}
        </button>

        <button
          onClick={onCustomize}
          className="rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          {localizationEngine.t(
  "consent.banner.customize"
)}
        </button>

        <button
          onClick={onAccept}
          className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          {localizationEngine.t(
  "consent.banner.accept"
)}
        </button>
      </div>
    </div>
  );
}