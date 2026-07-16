"use client";

import { useTransition } from "react";
import type { CookieBanner } from "@/modules/banner";

interface Props {
  id: string;

  banner: CookieBanner;
}

export function SaveBannerButton({
  id,
  banner,
}: Props) {
  const [
    pending,
    startTransition,
  ] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await fetch(
            `/api/banner/${id}`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                name: banner.name,
                position: banner.position,
                theme: banner.theme,
                layout: banner.layout,
                primary_color: banner.primaryColor,
                language: banner.language,
                show_logo: banner.showLogo,
                show_reject: banner.showReject,
                show_preferences: banner.showPreferences,
                consent_expiry_days: banner.consentExpiryDays,
              }),
            }
          );
        })
      }
      className="rounded-lg border px-4 py-2"
    >
      {pending
        ? "Saving..."
        : "Save Draft"}
    </button>
  );
}
