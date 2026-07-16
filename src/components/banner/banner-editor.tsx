"use client";

import { useState } from "react";

import type {
  CookieBanner,
} from "@/modules/banner";

import {
  embedService,
} from "@/modules/banner";

import {
  BannerSettings,
} from "./banner-settings";

import {
  BannerPreview,
} from "./banner-preview";

import {
  SaveBannerButton,
} from "./save-banner-button";

import {
  PublishBannerButton,
} from "./publish-banner-button";

import { EmbedCode } from "./embed-code";

interface Props {
  banner: CookieBanner;
}

export function BannerEditor({
  banner,
}: Props) {
  const [draft, setDraft] =
    useState(banner);

  return (
    <div className="grid grid-cols-2 gap-8">

      <BannerSettings
        banner={draft}
        onChange={setDraft}
      />

      <BannerPreview
        banner={draft}
      />
      <div className="mt-6 flex gap-3">

  <SaveBannerButton
    id={draft.id}
    banner={draft}
  />

  <PublishBannerButton
    id={draft.id}
  />

  {draft.embedToken && (
  <EmbedCode
    code={`<script
src="https://cdn.privystack.com/banner.js"
data-banner="${draft.embedToken}">
</script>`}
  />
)}

</div>

    </div>
  );
}