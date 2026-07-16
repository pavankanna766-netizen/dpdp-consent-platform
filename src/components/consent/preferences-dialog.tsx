"use client";

import { useState } from "react";

import { consentEngine } from "@/platform/consent";

import { CategoryToggle } from "./category-toggle";

export function PreferencesDialog() {
  const [analytics, setAnalytics] =
    useState(false);

  const [marketing, setMarketing] =
    useState(false);

  const [functional, setFunctional] =
    useState(false);
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-xl">
      <h2 className="text-xl font-semibold">
        Cookie Preferences
      </h2>

      <div className="mt-6 space-y-4">
        <CategoryToggle
          title="Necessary"
          description="Required for the website to function."
          checked
          disabled
        />

        <CategoryToggle
  title="Analytics"
  description="Help us improve the website."
  checked={analytics}
  onChange={setAnalytics}
/>

        <CategoryToggle
  title="Marketing"
  description="Personalized advertisements."
  checked={marketing}
  onChange={setMarketing}
/>

        <CategoryToggle
  title="Functional"
  description="Remember your settings."
  checked={functional}
  onChange={setFunctional}
/>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button className="rounded-lg border px-4 py-2">
          Cancel
        </button>

        <button
  onClick={() => {
  if (analytics) {
    consentEngine.grant("analytics");
  } else {
    consentEngine.deny("analytics");
  }

  if (marketing) {
    consentEngine.grant("marketing");
  } else {
    consentEngine.deny("marketing");
  }

  if (functional) {
    consentEngine.grant("functional");
  } else {
    consentEngine.deny("functional");
  }
}}
  className="rounded-lg bg-black px-4 py-2 text-white"
>
  Save Preferences
</button>
      </div>
    </div>
  );
}
