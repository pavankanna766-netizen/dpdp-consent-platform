import type {
  ConsentCategory,
  ConsentDecision,
  ConsentState,
} from "./types";

export class ConsentRegistry {
  private state: ConsentState = {
    necessary: "granted",
    analytics: "denied",
    marketing: "denied",
    preferences: "denied",
  };

  getState() {
    return this.state;
  }

  update(
    category: ConsentCategory,
    decision: ConsentDecision
  ) {
    this.state[category] =
      decision;
  }

  reset() {
    this.state = {
      necessary: "granted",
      analytics: "denied",
      marketing: "denied",
      preferences: "denied",
    };
  }
}

export const consentRegistry =
  new ConsentRegistry();