export type ConsentCategory =
  | "necessary"
  | "analytics"
  | "marketing"
  | "functional"
  | "personalization";

export type ConsentDecision =
  | "granted"
  | "denied";

export interface ConsentRecord {
  category: ConsentCategory;
  decision: ConsentDecision;
  timestamp: Date;
}

export interface ConsentEngine {
  initialize(): void;
}

export type ConsentState = {
  necessary: ConsentDecision;
  analytics: ConsentDecision;
  marketing: ConsentDecision;
  functional: ConsentDecision;
  personalization: ConsentDecision;
};
