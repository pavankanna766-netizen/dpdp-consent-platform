import type { ConsentState } from "../types";
const STORAGE_KEY =
  "privystack-consent";

export function saveConsent(
  state: ConsentState
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}

export function loadConsent() {
  if (typeof window === "undefined") {
    return null;
  }

  const value =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!value) {
    return null;
  }

  return JSON.parse(
    value
  ) as ConsentState;
}