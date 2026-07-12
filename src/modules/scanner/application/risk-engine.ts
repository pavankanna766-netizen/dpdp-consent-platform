export function determineRisk(
  score: number
): "low" | "medium" | "high" {
  if (score >= 85) {
    return "low";
  }

  if (score >= 60) {
    return "medium";
  }

  return "high";
}