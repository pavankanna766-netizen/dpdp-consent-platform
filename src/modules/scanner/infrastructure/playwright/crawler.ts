import { createBrowser } from "./browser";

import {
  classifyCookie,
} from "../../application/cookie-classifier";

import type {
  CookieInfo,
} from "../../domain/types";

export interface CrawlResult {
  cookies: CookieInfo[];
  scripts: string[];
  inlineScripts: string[];
  requests: string[];

  siteHost?: string;

  hasConsentBanner: boolean;
  hasRejectButton: boolean;
  hasManagePreferences: boolean;

  hasPrivacyPolicy: boolean;
  hasCookiePolicy: boolean;

  consentMode?: {
    detected: boolean;
    version: "v2" | "unknown";
    implementation: "advanced" | "basic" | "unknown";
    adStorage: boolean;
    analyticsStorage: boolean;
    adUserData: boolean;
    adPersonalization: boolean;
    waitForUpdate: boolean;
    score: number;
  };
}

export async function crawlWebsite(
  url: string
): Promise<CrawlResult> {
  const browser =
    await createBrowser();

  const context =
    await browser.newContext();

  const page =
    await context.newPage();

  // Optimize scan speeds by blocking non-essential visual resources
  await page.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (["image", "media", "font"].includes(type)) {
      route.abort().catch(() => {});
    } else {
      route.continue().catch(() => {});
    }
  });

  const requests = new Set<string>();

  page.on(
    "request",
    (request) => {
      requests.add(request.url());
    }
  );

  try {
    try {
      // Attempt domcontentloaded first, which is extremely fast and reliable
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });
      // Wait for the window load event to complete (maximum 10s wait)
      try {
        await page.waitForLoadState("load", { timeout: 10000 });
      } catch (e) {
        // Ignore load timeout
      }
      // Attempt to wait for network idle to catch dynamic trackers, but do not fail if it takes too long
      try {
        await page.waitForLoadState("networkidle", { timeout: 3000 });
      } catch (e) {
        // Ignore networkidle timeout
      }
    } catch (error) {
      console.warn("Navigation warning: page load incomplete", error);
    }

    const cookies =
      await context.cookies();

    const scripts =
      await page.$$eval(
        "script[src]",
        (elements) =>
          elements
            .map((script) =>
              script.getAttribute("src") ?? ""
            )
            .filter(Boolean)
      );

    const inlineScripts =
      await page.$$eval(
        "script:not([src])",
        (scripts) =>
          scripts.map(
            (script) =>
              script.textContent ??
              ""
          )
      );

    const pageText =
      (
        await page.textContent("body")
      )?.toLowerCase() ?? "";

    const links =
      await page.$$eval(
        "a",
        (anchors) =>
          anchors.map((anchor) => ({
            text:
              anchor.textContent?.trim() ??
              "",

            href:
              anchor.getAttribute("href") ??
              "",
          }))
      );

    // Look for common cookie banner elements/selectors
    const commonSelectors = [
      "#onetrust-banner-sdk",
      "#cookie-law-info-bar",
      ".cookie-banner",
      "#cookie-consent",
      ".cookie-consent",
      "#cookieconsent",
      ".cookieconsent",
      "#cookie-notice",
      ".cookie-notice",
      "#cc-banner",
      ".cc-window",
      "#tarteaucitronRoot",
      "#cookiefirst-cookies",
      "#usercentrics-root",
      "cm-cookie-banner",
      "div[class*='cookie' i][class*='banner' i]",
      "div[id*='cookie' i][id*='banner' i]",
      "div[class*='consent' i][class*='banner' i]",
      "div[id*='consent' i][id*='banner' i]"
    ];

    let bannerSelectorDetected = false;
    for (const selector of commonSelectors) {
      try {
        const element = page.locator(selector).first();
        if (element && await element.isVisible()) {
          bannerSelectorDetected = true;
          break;
        }
      } catch (e) {
        // Ignore
      }
    }

    const hasConsentBanner = bannerSelectorDetected ||
      [
        "accept cookies",
        "accept all",
        "cookie settings",
        "manage preferences",
        "privacy preferences",
        "we use cookies",
        "cookie consent",
      ].some((text) =>
        pageText.includes(text)
      );

    const buttonTexts = await page.$$eval("button, a, div[role='button']", (elements) =>
      elements.map(el => el.textContent?.trim().toLowerCase() ?? "").filter(Boolean)
    );

    const hasRejectButton = buttonTexts.some(text =>
      ["reject", "decline", "reject all", "deny", "disagree", "opt out", "no thank"].some(kw => text.includes(kw))
    ) || [
      "reject",
      "decline",
      "reject all",
    ].some((text) =>
      pageText.includes(text)
    );

    const hasManagePreferences = buttonTexts.some(text =>
      ["manage preferences", "cookie settings", "customize", "preferences", "settings", "manage cookies", "change preferences"].some(kw => text.includes(kw))
    ) || [
      "manage preferences",
      "cookie settings",
      "customize",
      "preferences",
    ].some((text) =>
      pageText.includes(text)
    );

    const hasPrivacyPolicy = links.some(
      (link) => {
        const text = link.text.toLowerCase();
        const href = link.href.toLowerCase();
        return (
          text.includes("privacy") ||
          text.includes("data protection") ||
          text.includes("data policy") ||
          text.includes("privacy statement") ||
          text.includes("privacy notice") ||
          href.includes("privacy") ||
          href.includes("data-protection") ||
          href.includes("data_protection")
        );
      }
    );

    const hasCookiePolicy = links.some(
      (link) => {
        const text = link.text.toLowerCase();
        const href = link.href.toLowerCase();
        return (
          text.includes("cookie policy") ||
          text.includes("cookie notice") ||
          text.includes("cookie settings") ||
          text.includes("cookies") ||
          text.includes("cookie statement") ||
          href.includes("cookie") ||
          href.includes("cookies")
        );
      }
    );

    // Google Consent Mode live evaluation
    const consentMode = await page.evaluate(() => {
      const dl = (window as Window & { dataLayer?: unknown[] }).dataLayer;
      let hasDefault = false;
      let hasUpdate = false;
      
      const settings = {
        adStorage: false,
        analyticsStorage: false,
        adUserData: false,
        adPersonalization: false,
        waitForUpdate: false,
      };

      if (Array.isArray(dl)) {
        for (const item of dl) {
          const eventItem = item as [string, string, Record<string, string> | undefined] | undefined;
          if (eventItem && eventItem[0] === 'consent') {
            const command = eventItem[1];
            const config = eventItem[2];
            if (command === 'default' || command === 'update') {
              if (command === 'default') hasDefault = true;
              if (command === 'update') hasUpdate = true;
              if (config && typeof config === 'object') {
                if (config.ad_storage === 'granted') settings.adStorage = true;
                if (config.analytics_storage === 'granted') settings.analyticsStorage = true;
                if (config.ad_user_data === 'granted') settings.adUserData = true;
                if (config.ad_personalization === 'granted') settings.adPersonalization = true;
                if (config.wait_for_update !== undefined) settings.waitForUpdate = true;
              }
            }
          }
        }
      }

      const detected = hasDefault || hasUpdate || typeof (window as Window & { gtag?: Function }).gtag === 'function';
      const implementation = hasDefault && hasUpdate ? "advanced" : (detected ? "basic" : "unknown");

      const checks = [
        hasDefault,
        hasUpdate,
        settings.adStorage,
        settings.analyticsStorage,
        settings.adUserData,
        settings.adPersonalization,
        settings.waitForUpdate,
      ];
      const score = Math.round(
        (checks.filter(Boolean).length / checks.length) * 100
      );

      return {
        detected,
        version: detected ? "v2" as const : "unknown" as const,
        implementation: implementation as "advanced" | "basic" | "unknown",
        adStorage: settings.adStorage,
        analyticsStorage: settings.analyticsStorage,
        adUserData: settings.adUserData,
        adPersonalization: settings.adPersonalization,
        waitForUpdate: settings.waitForUpdate,
        score,
      };
    }).catch(() => null);

    return {
      siteHost: new URL(page.url()).hostname.toLowerCase(),

      cookies: cookies.map(
        (cookie) => {
          const classification =
            classifyCookie(
              cookie.name
            );

          return {
            name: cookie.name,

            value: cookie.value,

            domain: cookie.domain,

            path: cookie.path,

            expires: cookie.expires,

            httpOnly:
              cookie.httpOnly,

            secure:
              cookie.secure,

            sameSite:
              cookie.sameSite,

            category:
              classification.category,

            provider:
              classification.provider,
          };
        }
      ),

      scripts,

      inlineScripts,

      requests: [...requests],

      hasConsentBanner,

      hasRejectButton,

      hasManagePreferences,

      hasPrivacyPolicy,

      hasCookiePolicy,

      consentMode: consentMode || undefined,
    };
  } finally {
    await browser.close();
  }
}
