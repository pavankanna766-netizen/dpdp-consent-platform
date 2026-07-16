export interface TrustCenterDashboard {
  trustCenter: {
    headline: string | null;
    description: string | null;
  };

  latestSummary: {
    dashboard: {
      score: number;
    };
  } | null;

  privacy: {
    id: string;
    status: string;
  } | null;

  cookies: {
    id: string;
    status: string;
  } | null;
}