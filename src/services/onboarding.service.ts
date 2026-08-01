import {
  findCompanyById,
  updateCompany,
} from "@/repositories/company.repository";
import {
  listCompanyApiKeys,
  createApiKey,
  findApiKeyByValue,
  recordApiKeyPing,
} from "@/repositories/api-key.repository";
import { getLatestScan } from "@/repositories/scanner.repository";
import { getPublishedPrivacyPolicy } from "@/repositories/privacy-policy.repository";
import { getPublishedCookiePolicy } from "@/repositories/cookie-policy.repository";

export interface OnboardingState {
  company: {
    id: string;
    company_name: string;
    website: string | null;
    industry: string;
    company_size: string;
    country: string;
    timezone: string;
    is_onboarded: boolean;
    onboarding_step: number;
    sdk_connected: boolean;
    sdk_last_ping_at: string | null;
  };
  completionPercentage: number;
  apiKeys: Array<{
    id: string;
    key_name: string;
    api_key: string;
    environment: string;
    is_active: boolean;
    last_used_at: string | null;
  }>;
  checklist: {
    profileCompleted: boolean;
    scanCompleted: boolean;
    policiesPublished: boolean;
    sdkConnected: boolean;
  };
}

export async function getOnboardingState(
  companyId: string
): Promise<OnboardingState> {
  const [
    companyRes,
    apiKeysRes,
    latestScanRes,
    privacyRes,
    cookiesRes,
  ] = await Promise.all([
    findCompanyById(companyId),
    listCompanyApiKeys(companyId),
    getLatestScan(companyId),
    getPublishedPrivacyPolicy(companyId),
    getPublishedCookiePolicy(companyId),
  ]);

  const company = companyRes.data;
  if (!company) {
    throw new Error("Company not found");
  }

  let apiKeys = apiKeysRes.data || [];
  if (apiKeys.length === 0) {
    const { data: newKey } = await createApiKey(
      companyId,
      "Live SDK Key",
      "production"
    );
    if (newKey) {
      apiKeys = [newKey];
    }
  }

  const profileCompleted = Boolean(
    company.company_name &&
      company.website &&
      company.industry &&
      company.country
  );
  const scanCompleted = Boolean(
    latestScanRes.data && latestScanRes.data.status === "completed"
  );
  const policiesPublished = Boolean(
    privacyRes.data && cookiesRes.data
  );
  const sdkConnected = Boolean(
    company.sdk_connected || apiKeys.some((k) => k.last_used_at !== null)
  );

  let score = 0;
  if (profileCompleted) score += 25;
  if (scanCompleted) score += 25;
  if (policiesPublished) score += 25;
  if (sdkConnected) score += 25;

  return {
    company: {
      id: company.id,
      company_name: company.company_name,
      website: company.website,
      industry: company.industry,
      company_size: company.company_size,
      country: company.country,
      timezone: company.timezone,
      is_onboarded: company.is_onboarded,
      onboarding_step: company.onboarding_step ?? 1,
      sdk_connected: sdkConnected,
      sdk_last_ping_at: company.sdk_last_ping_at,
    },
    completionPercentage: score,
    apiKeys,
    checklist: {
      profileCompleted,
      scanCompleted,
      policiesPublished,
      sdkConnected,
    },
  };
}

export async function saveOnboardingStep(
  companyId: string,
  step: number
) {
  return updateCompany(companyId, {
    onboarding_step: step,
  });
}

export async function finishOnboarding(companyId: string) {
  return updateCompany(companyId, {
    is_onboarded: true,
    onboarding_step: 5,
  });
}

export async function testSdkConnection(
  companyId: string,
  apiKeyStr: string
) {
  const keyRes = await findApiKeyByValue(apiKeyStr);
  if (!keyRes.data || keyRes.data.company_id !== companyId) {
    return { success: false, message: "Invalid API key for this company." };
  }

  await recordApiKeyPing(apiKeyStr);
  await updateCompany(companyId, {
    sdk_connected: true,
    sdk_last_ping_at: new Date().toISOString(),
  });

  return {
    success: true,
    message: "SDK connection verified successfully!",
    lastPingAt: new Date().toISOString(),
  };
}
