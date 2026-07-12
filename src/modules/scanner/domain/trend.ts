export interface TrendPoint {
  id: string;

  score: number;

  createdAt: string;
}

export interface PrivacyTrend {
  current: number;

  previous: number | null;

  change: number;

  trend:
    | "up"
    | "down"
    | "same";

  history: TrendPoint[];
}