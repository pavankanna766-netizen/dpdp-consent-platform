import type {
  DetectionResult,
} from "./detection";

export type RiskLevel =
  | "low"
  | "medium"
  | "high";

export interface RiskFinding {
  tracker: DetectionResult;

  level: RiskLevel;

  title: string;

  recommendation: string;
}