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
    functional: "denied",
    personalization: "denied",
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
      functional: "denied",
      personalization: "denied",
    };
  }
}

export const consentRegistry =
  new ConsentRegistry();
