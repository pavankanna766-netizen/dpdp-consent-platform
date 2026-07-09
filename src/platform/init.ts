import { initializePlatform } from "./bootstrap";

let initialized = false;

export function ensurePlatformInitialized() {
  if (initialized) {
    return;
  }

  initializePlatform();

  initialized = true;
}