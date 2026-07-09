"use client";

import { useState } from "react";

import { updateConsentSettings } from "@/app/settings/company/actions";

import type { CompanySettings } from "@/platform/settings/types";

type Props = {
  settings: CompanySettings;
};

export function ConsentEvidenceCard({
  settings,
}: Props) {
  const [ipStorage, setIpStorage] = useState(
    settings.consent.ipStorage
  );

  const [
    userAgentStorage,
    setUserAgentStorage,
  ] = useState(
    settings.consent.userAgentStorage
  );

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold">
          🛡️ Consent Evidence
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Configure how PrivyStack stores
          consent evidence for compliance
          with the Digital Personal Data
          Protection (DPDP) Act.
        </p>
      </div>

      <div className="mt-6 space-y-8">
        {/* IP Address */}
        <div>
          <h3 className="text-lg font-medium">
            IP Address
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Choose how visitor IP addresses
            should be stored as legal
            evidence.
          </p>

          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="ipStorage"
                value="none"
                checked={ipStorage === "none"}
                onChange={() =>
                  setIpStorage("none")
                }
              />
              Don&apos;t Store
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="ipStorage"
                value="hashed"
                checked={
                  ipStorage === "hashed"
                }
                onChange={() =>
                  setIpStorage("hashed")
                }
              />
              SHA-256 (Recommended)
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="ipStorage"
                value="raw"
                checked={ipStorage === "raw"}
                onChange={() =>
                  setIpStorage("raw")
                }
              />
              Store Raw
            </label>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* User Agent */}
        <div>
          <h3 className="text-lg font-medium">
            User Agent
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Control how much browser
            information is retained.
          </p>

          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="userAgentStorage"
                value="none"
                checked={
                  userAgentStorage ===
                  "none"
                }
                onChange={() =>
                  setUserAgentStorage(
                    "none"
                  )
                }
              />
              Don&apos;t Store
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="userAgentStorage"
                value="browser"
                checked={
                  userAgentStorage ===
                  "browser"
                }
                onChange={() =>
                  setUserAgentStorage(
                    "browser"
                  )
                }
              />
              Browser Only
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="userAgentStorage"
                value="full"
                checked={
                  userAgentStorage ===
                  "full"
                }
                onChange={() =>
                  setUserAgentStorage(
                    "full"
                  )
                }
              />
              Full User Agent
            </label>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={async () => {
            await updateConsentSettings({
              ...settings,
              consent: {
                ...settings.consent,
                ipStorage,
                userAgentStorage,
              },
            });

            alert("Settings saved successfully!");
          }}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}