import type { CookiePolicy } from "../domain/cookie-policy";

import type {
  CookieInventoryItem,
} from "@/modules/scanner/domain/cookie-inventory";

export class CookiePolicyService {
  generate(input: {
    companyName: string;
    website: string;
   cookies: CookieInventoryItem[];
  }): CookiePolicy {

const grouped = {
  necessary: input.cookies.filter(
    (cookie) =>
      cookie.category ===
      "necessary"
  ),

  analytics: input.cookies.filter(
    (cookie) =>
      cookie.category ===
      "analytics"
  ),

  marketing: input.cookies.filter(
    (cookie) =>
      cookie.category ===
      "marketing"
  ),

  preferences: input.cookies.filter(
    (cookie) =>
      cookie.category ===
      "preferences"
  ),

  unknown: input.cookies.filter(
    (cookie) =>
      cookie.category ===
      "unknown"
  ),
};

function renderCookies(
  title: string,
  cookies: typeof input.cookies
) {
  if (
    cookies.length === 0
  ) {
    return `${title}

No cookies detected.`;
  }

  return `${title}

${cookies
  .map(
    (cookie) => `
• ${cookie.name}

Provider: ${cookie.provider}

Purpose: ${cookie.purpose}

Duration: ${cookie.duration}
`
  )
  .join("\n")}`;
}

    const sections = [
      {
        id: "intro",
        title: "Cookie Policy",
        content: `${input.companyName} uses cookies to provide essential functionality, improve user experience, and analyze website performance.`,
      },
      {
        id: "what-are-cookies",
        title: "What Are Cookies?",
        content:
          "Cookies are small text files stored on your device when you visit a website.",
      },
      {
  id: "necessary",

  title:
    "Necessary Cookies",

  content:
    renderCookies(
      "Necessary Cookies",
      grouped.necessary
    ),
},

{
  id: "analytics",

  title:
    "Analytics Cookies",

  content:
    renderCookies(
      "Analytics Cookies",
      grouped.analytics
    ),
},

{
  id: "marketing",

  title:
    "Marketing Cookies",

  content:
    renderCookies(
      "Marketing Cookies",
      grouped.marketing
    ),
},

{
  id: "preferences",

  title:
    "Preference Cookies",

  content:
    renderCookies(
      "Preference Cookies",
      grouped.preferences
    ),
},

{
  id: "unknown",

  title:
    "Other Cookies",

  content:
    renderCookies(
      "Other Cookies",
      grouped.unknown
    ),
},
      {
        id: "manage-cookies",
        title: "Managing Cookies",
        content:
          "You can manage or withdraw your consent through our cookie banner at any time.",
      },
    ];

    return {
      title: "Cookie Policy",
      version: "1.0",
      sections,
    };
  }
}

export const cookiePolicyService =
  new CookiePolicyService();