"use client";

import { useState } from "react";

import {
  loadConsent,
  saveConsent,
} from "@/platform/consent/storage/browser-storage";

import { ConsentBanner } from "./banner";
import { PreferencesDialog } from "./preferences-dialog";

import { ConsentService } from "@/sdk/consent";
import { PrivyStack } from "@/sdk";

import { visitorEngine } from "@/platform/visitor";
import { consentEngine } from "@/platform/consent";

export function ConsentController() {
  const [bannerVisible, setBannerVisible] =
    useState(() => {
      if (typeof window === "undefined") {
        return true;
      }

      return loadConsent() === null;
    });

  const [preferencesOpen, setPreferencesOpen] =
    useState(false);

  const sdk =
    PrivyStack.getClient();

  const consentService =
    new ConsentService(
      sdk.getApi()
    );

  const token =
    sdk.getConfig().token;

  return (
    <>
      {bannerVisible && (
        <ConsentBanner
          onAccept={async () => {
            consentEngine.grant("analytics");
            consentEngine.grant("marketing");
            consentEngine.grant("functional");

            saveConsent(
              consentEngine.getState()
            );

            setBannerVisible(false);

            try {
              const visitorId =
                visitorEngine.getVisitorId();

              await consentService.accept(
                token,
                visitorId
              );

            } catch (error) {
              console.error(
                "Failed to sync consent:",
                error
              );
            }
          }}
          onReject={async () => {
            consentEngine.deny("analytics");
            consentEngine.deny("marketing");
            consentEngine.deny("functional");

            saveConsent(
              consentEngine.getState()
            );

            setBannerVisible(false);

            try {
              const visitorId =
                visitorEngine.getVisitorId();

              await consentService.reject(
                token,
                visitorId
              );

            } catch (error) {
              console.error(
                "Failed to sync rejection:",
                error
              );
            }
          }}
          onCustomize={() =>
            setPreferencesOpen(true)
          }
        />
      )}

      {preferencesOpen && (
        <PreferencesDialog />
      )}
    </>
  );
}
