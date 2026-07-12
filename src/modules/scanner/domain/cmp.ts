export interface CMPDefinition {
  id: string;

  provider: string;

  scripts: string[];

  domains: string[];

  description: string;
}

export interface CMPDetection {
  cmp: CMPDefinition;

  matchedBy: (
    | "script"
    | "request"
  )[];

  confidence: number;
}