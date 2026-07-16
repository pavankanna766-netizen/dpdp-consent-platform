import { platformRuntime } from "./runtime";

let initialized = false;

export function ensurePlatformInitialized() {
  if (initialized) {
    return;
  }

  platformRuntime.initialize();

  initialized = true;
}
