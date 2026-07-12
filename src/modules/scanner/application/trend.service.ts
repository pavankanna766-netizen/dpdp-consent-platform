import type {
  PrivacyTrend,
} from "../domain/trend";

export class TrendService {
  calculate(
    scans: {
      id: string;

      overall_score: number;

      created_at: string;
    }[]
  ): PrivacyTrend {
    if (scans.length === 0) {
      return {
        current: 0,

        previous: null,

        change: 0,

        trend: "same",

        history: [],
      };
    }

    const current =
      scans[0];

    const previous =
      scans[1] ?? null;

    const change =
      previous
        ? current.overall_score -
          previous.overall_score
        : 0;

    return {
      current:
        current.overall_score,

      previous:
        previous?.overall_score ??
        null,

      change,

      trend:
        change > 0
          ? "up"
          : change < 0
          ? "down"
          : "same",

      history:
        scans.map(
          (scan) => ({
            id: scan.id,

            score:
              scan.overall_score,

            createdAt:
              scan.created_at,
          })
        ),
    };
  }
}

export const trendService =
  new TrendService();