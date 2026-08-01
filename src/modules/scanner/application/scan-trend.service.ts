import { listRecentScans } from "@/repositories/scanner.repository";

export interface ScanTrendPoint {
  scanId: string;
  url: string;
  completedAt: string;
  score: number;
  cookiesFound: number;
  trackersFound: number;
  findingsCount: number;
}

export interface ScanTrendSummary {
  latestScore: number | null;
  previousScore: number | null;
  scoreChange: number; // positive = improvement, negative = drop
  trendDirection: "improving" | "declining" | "stable" | "no_data";
  history: ScanTrendPoint[];
  averageScore: number;
}

export class ScanTrendService {
  async getTrend(companyId: string): Promise<ScanTrendSummary> {
    const { data: scans = [] } = await listRecentScans(companyId, 10);

    const completedScans = (scans || [])
      .filter((s) => s.status === "completed" && s.overall_score !== null);

    if (completedScans.length === 0) {
      return {
        latestScore: null,
        previousScore: null,
        scoreChange: 0,
        trendDirection: "no_data",
        history: [],
        averageScore: 0,
      };
    }

    const history: ScanTrendPoint[] = completedScans.map((s) => ({
      scanId: s.id,
      url: s.url,
      completedAt: s.completed_at || s.created_at,
      score: s.overall_score || 0,
      cookiesFound: s.cookies_found || 0,
      trackersFound: s.trackers_found || 0,
      findingsCount: s.findings_count || 0,
    }));

    const latestScore = history[0]?.score ?? null;
    const previousScore = history[1]?.score ?? null;

    let scoreChange = 0;
    let trendDirection: "improving" | "declining" | "stable" | "no_data" = "stable";

    if (latestScore !== null && previousScore !== null) {
      scoreChange = latestScore - previousScore;
      if (scoreChange > 0) trendDirection = "improving";
      else if (scoreChange < 0) trendDirection = "declining";
      else trendDirection = "stable";
    }

    const totalScore = history.reduce((acc, h) => acc + h.score, 0);
    const averageScore = Math.round(totalScore / history.length);

    return {
      latestScore,
      previousScore,
      scoreChange,
      trendDirection,
      history,
      averageScore,
    };
  }
}

export const scanTrendService = new ScanTrendService();
