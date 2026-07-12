import {
  consentBannerRule,
} from "./consent-banner-rule";

import {
  googleAnalyticsRule,
} from "./google-analytics-rule";

import {
  managePreferencesRule,
} from "./manage-preferences-rule";

import {
  marketingTrackerRule,
} from "./marketing-tracker-rule";

import {
  privacyPolicyRule,
} from "./privacy-policy-rule";

import {
  rejectButtonRule,
} from "./reject-button-rule";

import {
  insecureCookieRule,
} from "./insecure-cookie-rule";

import {
  httpOnlyCookieRule,
} from "./http-only-cookie-rule";

import {
  RuleRegistry,
} from "../rule-registry";

import {
  sameSiteRule,
} from "./same-site-rule";

import {
  sameSiteSecureRule,
} from "./same-site-secure-rule";

import {
  longLivedCookieRule,
} from "./long-lived-cookie-rule";

import {
  excessiveCookieRule,
} from "./excessive-cookie-rule";

import {
  unknownCookieRule,
} from "./unknown-cookie-rule";

import {
  consentWithdrawalRule,
} from "./consent-withdrawal-rule";

import {
  cookieCategoryRule,
} from "./cookie-category-rule";

import {
  excessiveMarketingRule,
} from "./excessive-marketing-rule";

import {
  dataRetentionRule,
} from "./data-retention-rule";

import {
  privacyContactRule,
} from "./privacy-contact-rule";

import {
  sessionCookieRule,
} from "./session-cookie-rule";

import {
  persistentCookieRule,
} from "./persistent-cookie-rule";

import {
  thirdPartyCookieRule,
} from "./third-party-cookie-rule";

import {
  duplicateCookieRule,
} from "./duplicate-cookie-rule";

import {
  sensitiveCookieRule,
} from "./sensitive-cookie-rule";

const rules = [
  consentBannerRule,

  rejectButtonRule,

  managePreferencesRule,

  privacyPolicyRule,

  marketingTrackerRule,

  googleAnalyticsRule,

  insecureCookieRule,

  httpOnlyCookieRule,

  sameSiteRule,

sameSiteSecureRule,

longLivedCookieRule,

excessiveCookieRule,

unknownCookieRule,

consentWithdrawalRule,

cookieCategoryRule,

excessiveMarketingRule,

dataRetentionRule,

privacyContactRule,

sessionCookieRule,

persistentCookieRule,

thirdPartyCookieRule,

duplicateCookieRule,

sensitiveCookieRule,
];

export const complianceRules =
  rules;

export const complianceRegistry =
  new RuleRegistry(
    rules
  );