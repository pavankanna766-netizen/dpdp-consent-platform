import type {
  TrackerDefinition,
} from "./tracker";

export interface DetectionInput {
  cookies: string[];

  scripts: string[];

  requests: string[];
}

export type EvidenceType =
  | "cookie"
  | "script"
  | "request";

export type MatchStrategy =
  | "exact"
  | "wildcard"
  | "contains"
  | "regex";

export interface DetectionEvidence {
  type: EvidenceType;

  value: string;

  pattern: string;

  strategy: MatchStrategy;

  weight: number;
}

export interface DetectionResult {
  tracker: TrackerDefinition;

  confidence: number;

  matchedBy: EvidenceType[];

  evidence: DetectionEvidence[];
}