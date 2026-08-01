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
    await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      viewport: {
        width: 1280,
        height: 800,
      },
    });

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
      // Attempt domcontentloaded first, which is fast and reliable
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      // Wait for the window load event to complete (maximum 10s wait)
      try {
        await page.waitForLoadState("load", { timeout: 10000 });
      } catch {
        // Ignore load timeout
      }
      // Wait for network idle to catch dynamic trackers and async scripts
      try {
        await page.waitForLoadState("networkidle", { timeout: 8000 });
      } catch {
        // Ignore networkidle timeout
      }
    } catch (error) {
      console.warn("Navigation warning: page load incomplete", error);
    }

    // Give asynchronous CMP scripts a brief moment to render
    await page.waitForTimeout(2000).catch(() => {});

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

    const clickableElements =
      await page.$$eval(
        "a, button, div[role='button'], span[role='button']",
        (elements) =>
          elements.map((el) => ({
            text: el.textContent?.trim() ?? "",
            href: el.getAttribute("href") ?? "",
            tag: el.tagName.toLowerCase(),
            role: el.getAttribute("role") ?? "",
            id: el.id ?? "",
            className: typeof el.className === "string" ? el.className : "",
          }))
      );

    // Look for common cookie banner elements/selectors
    const commonSelectors = [
      "#onetrust-banner-sdk",
      "#onetrust-consent-sdk",
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
      ".cmp-container",
      "#cmpbox",
      "#notice-cookie-block",
      "div[data-testid='cookie-policy-dialog']",
      "#CybotCookiebotDialog",
      ".sp-message-container",
      "#truste-consent-track",
      "div[class*='cookie' i][class*='banner' i]",
      "div[id*='cookie' i][id*='banner' i]",
      "div[class*='consent' i][class*='banner' i]",
      "div[id*='consent' i][id*='banner' i]"
    ];

    let bannerSelectorDetected = false;
    for (const selector of commonSelectors) {
      try {
        const element = page.locator(selector).first();
        if (element && (await element.isVisible())) {
          bannerSelectorDetected = true;
          break;
        }
      } catch {
        // Ignore
      }
    }

    const buttonTexts = clickableElements
      .map((el) => el.text.toLowerCase())
      .filter(Boolean);

    const hasConsentBanner =
      bannerSelectorDetected ||
      buttonTexts.some((text) =>
        [
          "accept cookies",
          "accept all",
          "allow all",
          "allow cookies",
          "accept recommended",
          "cookie settings",
          "manage preferences",
          "privacy preferences",
          "agree & proceed",
        ].some((kw) => text.includes(kw))
      ) ||
      [
        "we use cookies",
        "cookie consent",
        "cookie preferences",
        "this site uses cookies",
        "by clicking accept",
        "privacy settings",
      ].some((text) => pageText.includes(text));

    const hasRejectButton =
      buttonTexts.some((text) =>
        [
          "reject",
          "decline",
          "reject all",
          "deny",
          "disagree",
          "opt out",
          "no thank",
          "refuse",
          "necessary only",
        ].some((kw) => text.includes(kw))
      );

    const hasManagePreferences =
      buttonTexts.some((text) =>
        [
          "manage preferences",
          "cookie settings",
          "customize",
          "preferences",
          "settings",
          "manage cookies",
          "change preferences",
          "cookie details",
        ].some((kw) => text.includes(kw))
      );

    const hasPrivacyPolicy = clickableElements.some((el) => {
      const text = el.text.toLowerCase();
      const href = el.href.toLowerCase();
      return (
        text.includes("privacy policy") ||
        text.includes("privacy notice") ||
        text.includes("privacy statement") ||
        text.includes("data protection") ||
        text.includes("data policy") ||
        text === "privacy" ||
        href.includes("privacy") ||
        href.includes("data-protection") ||
        href.includes("data_protection")
      );
    });

    const hasCookiePolicy = clickableElements.some((el) => {
      const text = el.text.toLowerCase();
      const href = el.href.toLowerCase();
      return (
        text.includes("cookie policy") ||
        text.includes("cookie notice") ||
        text.includes("cookie statement") ||
        text.includes("cookies policy") ||
        text === "cookie settings" ||
        text === "manage cookies" ||
        href.includes("cookie-policy") ||
        href.includes("cookie_policy") ||
        href.includes("cookies-policy")
      );
    });

    // Google Consent Mode live evaluation
    const consentMode = await page
      .evaluate(() => {
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
            let command = "";
            let config: Record<string, unknown> | undefined;

            if (Array.isArray(item) && item.length >= 2) {
              if (item[0] === "consent") {
                command = String(item[1]);
                config = item[2] as Record<string, unknown> | undefined;
              }
            } else if (item && typeof item === "object") {
              const obj = item as Record<string, unknown>;
              if (obj["0"] === "consent") {
                command = String(obj["1"]);
                config = obj["2"] as Record<string, unknown> | undefined;
              }
            }

            if (command === "default" || command === "update") {
              if (command === "default") hasDefault = true;
              if (command === "update") hasUpdate = true;
              if (config && typeof config === "object") {
                if (config.ad_storage === "granted") settings.adStorage = true;
                if (config.analytics_storage === "granted")
                  settings.analyticsStorage = true;
                if (config.ad_user_data === "granted")
                  settings.adUserData = true;
                if (config.ad_personalization === "granted")
                  settings.adPersonalization = true;
                if (config.wait_for_update !== undefined)
                  settings.waitForUpdate = true;
              }
            }
          }
        }

        const detected =
          hasDefault ||
          hasUpdate ||
          typeof (window as Window & { gtag?: (...args: unknown[]) => unknown })
            .gtag === "function";
        const implementation =
          hasDefault && hasUpdate
            ? "advanced"
            : detected
            ? "basic"
            : "unknown";

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
          version: detected ? ("v2" as const) : ("unknown" as const),
          implementation: implementation as
            | "advanced"
            | "basic"
            | "unknown",
          adStorage: settings.adStorage,
          analyticsStorage: settings.analyticsStorage,
          adUserData: settings.adUserData,
          adPersonalization: settings.adPersonalization,
          waitForUpdate: settings.waitForUpdate,
          score,
        };
      })
      .catch(() => null);

    return {
      siteHost: new URL(page.url()).hostname.toLowerCase(),

      cookies: cookies.map((cookie) => {
        const classification = classifyCookie(cookie.name);

        return {
          name: cookie.name,

          value: cookie.value,

          domain: cookie.domain,

          path: cookie.path,

          expires: cookie.expires,

          httpOnly: cookie.httpOnly,

          secure: cookie.secure,

          sameSite: cookie.sameSite,

          category: classification.category,

          provider: classification.provider,
        };
      }),

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
