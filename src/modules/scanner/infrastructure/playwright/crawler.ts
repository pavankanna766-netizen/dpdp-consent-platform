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

  hasConsentBanner: boolean;
  hasRejectButton: boolean;
  hasManagePreferences: boolean;

  hasPrivacyPolicy: boolean;
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

  const requests = new Set<string>();

  page.on(
    "request",
    (request) => {
      requests.add(request.url());
    }
  );

  try {
    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30_000,
    });

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
              anchor.textContent?.toLowerCase() ??
              "",

            href:
              anchor.getAttribute("href")?.toLowerCase() ??
              "",
          }))
      );

    const hasConsentBanner =
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

    const hasRejectButton =
      [
        "reject",
        "decline",
        "reject all",
      ].some((text) =>
        pageText.includes(text)
      );

    const hasManagePreferences =
      [
        "manage preferences",
        "cookie settings",
        "customize",
        "preferences",
      ].some((text) =>
        pageText.includes(text)
      );

    const hasPrivacyPolicy =
      links.some(
        (link) =>
          link.text.includes(
            "privacy"
          ) ||
          link.href.includes(
            "/privacy"
          ) ||
          link.href.includes(
            "privacy-policy"
          )
      );

    return {
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
    };
  } finally {
    await browser.close();
  }
}