import { RuleRegistry } from "../rule-registry";
import { consentBannerRule } from "./consent-banner-rule";
import { consentWithdrawalRule } from "./consent-withdrawal-rule";
import { excessiveCookieRule } from "./excessive-cookie-rule";
import { managePreferencesRule } from "./manage-preferences-rule";
import { persistentCookieRule } from "./persistent-cookie-rule";
import { privacyPolicyRule } from "./privacy-policy-rule";
import { cookiePolicyRule } from "./cookie-policy-rule";
import { rejectButtonRule } from "./reject-button-rule";
import { sameSiteSecureRule } from "./same-site-secure-rule";
import { sensitiveCookieRule } from "./sensitive-cookie-rule";
import { sessionCookieRule } from "./session-cookie-rule";
import { thirdPartyCookieRule } from "./third-party-cookie-rule";
import { unknownCookieRule } from "./unknown-cookie-rule";

/**
 * Only rules with a directly observable signal are enabled. Broad cookie
 * characteristics remain inventory observations, not compliance penalties.
 */
const rules = [
  consentBannerRule,
  rejectButtonRule,
  managePreferencesRule,
  consentWithdrawalRule,
  privacyPolicyRule,
  cookiePolicyRule,
  sameSiteSecureRule,
  sensitiveCookieRule,
  excessiveCookieRule,
  unknownCookieRule,
  sessionCookieRule,
  persistentCookieRule,
  thirdPartyCookieRule,
];

export const complianceRules = rules;

export const complianceRegistry = new RuleRegistry(rules);
