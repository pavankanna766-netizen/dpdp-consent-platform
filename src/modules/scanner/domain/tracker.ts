export type TrackerCategory =
  | "analytics"
  | "marketing"
  | "monitoring"
  | "tag-manager"
  | "session-recording"
  | "support"
  | "necessary"
  | "payments";

export interface TrackerDefinition {
  id: string;

  provider: string;

  category: TrackerCategory;

  requiresConsent: boolean;

  cookies: string[];

  scripts: string[];

  domains: string[];

  description: string;
}