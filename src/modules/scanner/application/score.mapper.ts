import type {
  ScoreBreakdown,
} from "../domain/score";

export function mapScoreBreakdown(
  breakdown: ScoreBreakdown
) {
  return {
    score: breakdown.score,

    items:
      breakdown.items,
  };
}