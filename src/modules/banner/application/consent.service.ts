import {
  createConsentPreference,
  getLatestConsentPreference,
  listConsentPreferences,
} from "@/repositories/consent-preference.repository";
import { getPublishedCookiePolicy } from "@/repositories/cookie-policy.repository";
import { getPublishedPrivacyPolicy } from "@/repositories/privacy-policy.repository";
import { publishEvent, PlatformEvents } from "@/platform";
import { ensurePlatformInitialized } from "@/platform/init";
import { NotFoundError } from "@/platform/errors";
import { getCompanyConsent, getConsentReceipt, getLatestActiveConsent, grantConsent, revokeConsent } from "@/services/consent.service";
import { ensureDefaultConsentTemplate } from "@/services/consent-template.service";

import { bannerService } from "./banner.service";
import type {
  BannerConsentRequest,
  BannerPreferenceCategories,
} from "../domain/preferences";

type Evidence = {
  ipAddress?: string;
  userAgent?: string;
};

type StoredPreference = {
  id: string;
  consent_id: string | null;
  decision: "accepted" | "rejected" | "saved" | "withdrawn";
  categories: BannerPreferenceCategories;
  expires_at: string | null;
  privacy_policy_version: number | null;
  cookie_policy_version: number | null;
  created_at: string;
};

export class BannerConsentService {
  async record(request: BannerConsentRequest, evidence: Evidence = {}) {
    ensurePlatformInitialized();
    const { data: banner, error } = await bannerService.getByEmbedToken(request.bannerToken);

    if (error) throw error;
    if (!banner) throw new NotFoundError("Published cookie banner");

    const template = await ensureDefaultConsentTemplate(banner.company_id);
    const [privacyPolicy, cookiePolicy] = await Promise.all([
      getPublishedPrivacyPolicy(banner.company_id),
      getPublishedCookiePolicy(banner.company_id),
    ]);
    this.throwUnexpectedPolicyError(privacyPolicy.error);
    this.throwUnexpectedPolicyError(cookiePolicy.error);

    const { data: previous, error: previousError } = await getLatestConsentPreference(
      banner.company_id,
      banner.id,
      request.visitorId
    );
    if (previousError) throw previousError;
    const prior = previous as unknown as StoredPreference | null;

    if (request.action === "withdraw") {
      const active = await getLatestActiveConsent(
        banner.company_id,
        template.id,
        request.visitorId
      );

      const withdrawn = active
        ? await revokeConsent(banner.company_id, active.id)
        : null;

      return this.persist({
        banner,
        request,
        consentId: withdrawn?.id ?? null,
        decision: "withdrawn",
        privacyVersion: privacyPolicy.data?.version ?? null,
        cookieVersion: cookiePolicy.data?.version ?? null,
        expiresAt: null,
      }, prior);
    }

    const categories = this.categoriesFor(request.action, request.categories);
    const consent = await grantConsent({
      company_id: banner.company_id,
      template_id: template.id,
      subject_identifier: request.visitorId,
      version: template.version,
      consent_text: template.consent_text,
      language: request.language,
      ip_address: evidence.ipAddress,
      user_agent: evidence.userAgent,
      categories,
      decision: request.action === "accept" ? "accept" : request.action === "reject" ? "reject" : "preferences",
      forceNew: true,
      emitEvent: false,
      metadata: {
        bannerId: banner.id,
        bannerVersion: banner.version,
        privacyPolicyVersion: privacyPolicy.data?.version ?? null,
        cookiePolicyVersion: cookiePolicy.data?.version ?? null,
        preferenceAction: request.action,
      },
      evidence: {
        pageUrl: request.pageUrl,
        referrer: request.referrer,
        bannerVersion: banner.version,
      },
    });

    const expiry = new Date();
    expiry.setUTCDate(expiry.getUTCDate() + banner.consent_expiry_days);

    return this.persist({
      banner,
      request: { ...request, categories },
      consentId: consent.id,
      decision: request.action === "accept" ? "accepted" : request.action === "reject" ? "rejected" : "saved",
      privacyVersion: privacyPolicy.data?.version ?? null,
      cookieVersion: cookiePolicy.data?.version ?? null,
      expiresAt: expiry.toISOString(),
    }, prior);
  }

  async displayed(bannerToken: string, visitorId: string, evidence: Evidence = {}) {
    ensurePlatformInitialized();
    const { data: banner, error } = await bannerService.getByEmbedToken(bannerToken);
    if (error) throw error;
    if (!banner) throw new NotFoundError("Published cookie banner");

    await publishEvent(PlatformEvents.BANNER_DISPLAYED, {
      companyId: banner.company_id,
      bannerId: banner.id,
      subject: visitorId,
      ipAddress: evidence.ipAddress,
      userAgent: evidence.userAgent,
    });
  }

  async current(bannerToken: string, visitorId: string) {
    const { data: banner, error } = await bannerService.getByEmbedToken(bannerToken);
    if (error) throw error;
    if (!banner) throw new NotFoundError("Published cookie banner");

    const [{ data: latest, error: preferenceError }, privacyPolicy, cookiePolicy] = await Promise.all([
      getLatestConsentPreference(banner.company_id, banner.id, visitorId),
      getPublishedPrivacyPolicy(banner.company_id),
      getPublishedCookiePolicy(banner.company_id),
    ]);
    if (preferenceError) throw preferenceError;
    this.throwUnexpectedPolicyError(privacyPolicy.error);
    this.throwUnexpectedPolicyError(cookiePolicy.error);

    const preference = latest as unknown as StoredPreference | null;
    const expired = !preference?.expires_at || new Date(preference.expires_at) <= new Date();
    const policyChanged = preference
      ? preference.privacy_policy_version !== (privacyPolicy.data?.version ?? null) ||
        preference.cookie_policy_version !== (cookiePolicy.data?.version ?? null)
      : false;

    return {
      preference,
      requiresReview: !preference || preference.decision === "withdrawn" || expired || policyChanged,
      policyVersions: {
        privacy: privacyPolicy.data?.version ?? null,
        cookie: cookiePolicy.data?.version ?? null,
      },
      bannerVersion: banner.version,
    };
  }

  async history(bannerToken: string, visitorId: string) {
    const { data: banner, error } = await bannerService.getByEmbedToken(bannerToken);
    if (error) throw error;
    if (!banner) throw new NotFoundError("Published cookie banner");
    const { data, error: historyError } = await listConsentPreferences(
      banner.company_id,
      banner.id,
      visitorId
    );
    if (historyError) throw historyError;
    return data ?? [];
  }

  async receipt(bannerToken: string, visitorId: string) {
    const { data: banner, error } = await bannerService.getByEmbedToken(bannerToken);
    if (error) throw error;
    if (!banner) throw new NotFoundError("Published cookie banner");

    const { data: preference, error: preferenceError } = await getLatestConsentPreference(
      banner.company_id,
      banner.id,
      visitorId
    );
    if (preferenceError) throw preferenceError;
    const storedPreference = preference as unknown as StoredPreference | null;
    if (!storedPreference?.consent_id) throw new NotFoundError("Consent receipt");

    const consent = await getCompanyConsent(banner.company_id, storedPreference.consent_id);
    return getConsentReceipt(consent);
  }

  private categoriesFor(
    action: Exclude<BannerConsentRequest["action"], "withdraw">,
    categories: BannerPreferenceCategories
  ): BannerPreferenceCategories {
    if (action === "accept") {
      return { analytics: true, marketing: true, functional: true, personalization: true };
    }
    if (action === "reject") {
      return { analytics: false, marketing: false, functional: false, personalization: false };
    }
    return categories;
  }

  private throwUnexpectedPolicyError(error: { code?: string } | null) {
    // A missing published policy is valid; any other database error is not.
    if (error && error.code !== "PGRST116") {
      throw error;
    }
  }

  private async persist(input: {
    banner: { id: string; company_id: string; version: number };
    request: BannerConsentRequest;
    consentId: string | null;
    decision: "accepted" | "rejected" | "saved" | "withdrawn";
    privacyVersion: number | null;
    cookieVersion: number | null;
    expiresAt: string | null;
  }, previous: StoredPreference | null) {
    const { data, error } = await createConsentPreference({
      company_id: input.banner.company_id,
      banner_id: input.banner.id,
      consent_id: input.consentId,
      subject_identifier: input.request.visitorId,
      decision: input.decision,
      categories: input.request.categories,
      banner_version: input.banner.version,
      privacy_policy_version: input.privacyVersion,
      cookie_policy_version: input.cookieVersion,
      expires_at: input.expiresAt,
      metadata: { pageUrl: input.request.pageUrl, referrer: input.request.referrer },
    });
    if (error) throw error;

    const policyReaccepted = previous &&
      (previous.privacy_policy_version !== input.privacyVersion ||
        previous.cookie_policy_version !== input.cookieVersion);
    const eventType = input.decision === "withdrawn"
      ? PlatformEvents.CONSENT_WITHDRAWN
      : policyReaccepted
        ? PlatformEvents.CONSENT_POLICY_REACCEPTED
        : input.decision === "saved"
          ? PlatformEvents.CONSENT_PREFERENCE_CHANGED
          : previous
            ? PlatformEvents.CONSENT_UPDATED
            : input.decision === "rejected"
              ? PlatformEvents.CONSENT_REJECTED
              : PlatformEvents.CONSENT_ACCEPTED;

    await publishEvent(eventType, {
      companyId: input.banner.company_id,
      consentId: input.consentId,
      bannerId: input.banner.id,
      preferenceId: data?.id,
      subject: input.request.visitorId,
      action: input.decision,
      policyReaccepted,
    });

    return data;
  }
}

export const bannerConsentService = new BannerConsentService();
