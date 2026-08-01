export interface TrustCenterDashboard {
  company: {
    id: string;
    company_name: string;
    website: string | null;
    slug: string;
    industry: string;
    company_size: string;
    country: string;
    timezone: string;
    is_onboarded: boolean;
  };
  trustCenter: {
    headline: string | null;
    description: string | null;
  };
  latestSummary: {
    scan: {
      completed_at?: string;
      started_at?: string;
      cookies_found?: number;
      trackers_found?: number;
      findings_count?: number;
    } | null;
    dashboard: {
      score: number;
    };
  } | null;
  privacyScore: number;
  privacy: {
    id: string;
    status: string;
    version?: number;
  } | null;
  cookies: {
    id: string;
    status: string;
    version?: number;
  } | null;
  banner: {
    id: string;
    name: string;
    status: string;
    embed_token?: string;
  } | null;
  publicLinks: {
    privacyPolicy: string | null;
    cookiePolicy: string | null;
    trustCenter: string | null;
  };
}