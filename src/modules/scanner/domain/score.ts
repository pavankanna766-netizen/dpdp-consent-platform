export interface ScoreBreakdownItem {
  id: string;

  title: string;

  impact: number;

  type: "reward" | "penalty";
}

export interface ScoreBreakdown {
  score: number;

  items: ScoreBreakdownItem[];
}