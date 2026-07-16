import type {
  CookieBanner,
} from "@/modules/banner";

import {
  BannerDisplay,
} from "./banner-display";

interface Props {
  banner: CookieBanner;
}

export function BannerPreview({
  banner,
}: Props) {
  return (
    <div className="rounded-xl border bg-slate-100 p-8">
  <BannerDisplay
    position={banner.position}
  >
    
      <div
  className={`rounded-xl border p-5 shadow ${
    banner.theme === "dark"
      ? "bg-slate-900"
      : "bg-white"
  }`}
>

        <div
  className={`font-semibold ${
    banner.theme === "dark"
      ? "text-white"
      : "text-black"
  }`}
>
          We value your privacy
        </div>

        <p className="mt-3 text-sm text-gray-600">
          We use cookies to improve
          your browsing experience.
        </p>

        <div className="mt-5 flex gap-2">

          <button
            style={{
              background:
                banner.primaryColor,
            }}
            className="rounded-lg px-4 py-2 text-white"
          >
            Accept
          </button>

          {banner.showReject && (
            <button className="rounded-lg border px-4 py-2">
              Reject
            </button>
          )}

          {banner.showPreferences && (
            <button className="rounded-lg border px-4 py-2">
              Preferences
            </button>
          )}

        </div>

      </div>
      </BannerDisplay>
</div>
    
  );
}