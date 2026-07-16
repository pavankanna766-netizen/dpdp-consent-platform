"use client";

import type {
  CookieBanner,
} from "@/modules/banner";

import {
  ColorPicker,
} from "./color-picker";

interface Props {
  banner: CookieBanner;

  onChange: (
    banner: CookieBanner
  ) => void;
}

export function BannerSettings({
  banner,
  onChange,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="text-xl font-semibold">
        Banner Settings
      </h2>

      <div className="mt-6 space-y-5">

        <div>
          <label className="text-sm font-medium">
            Banner Name
          </label>

          <input
            value={banner.name}

onChange={(e) =>
  onChange({
    ...banner,
    name: e.target.value,
  })
}
            className="mt-2 w-full rounded-lg border p-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Theme
          </label>

          <select
            value={banner.theme}

onChange={(e) =>
  onChange({
    ...banner,
    theme: e.target
      .value as CookieBanner["theme"],
  })
}
            className="mt-2 w-full rounded-lg border p-2"
          >
            <option value="light">
              Light
            </option>

            <option value="dark">
              Dark
            </option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">
            Position
          </label>

          <select
            value={banner.position}

onChange={(e) =>
  onChange({
    ...banner,
    position: e.target
      .value as CookieBanner["position"],
  })
}
            className="mt-2 w-full rounded-lg border p-2"
          >
            <option value="bottom">
              Bottom
            </option>

            <option value="top">
              Top
            </option>

            <option value="floating">
              Floating
            </option>
          </select>

        <ColorPicker
  value={banner.primaryColor}
  onChange={(value) =>
    onChange({
      ...banner,
      primaryColor: value,
    })
  }
/>

        </div>
      </div>
    </div>
  );
}