import { trackerLibrary } from "./library";

import { matchTracker } from "./matcher";

import type {
  DetectionInput,
  DetectionResult,
} from "../../domain/detection";

export function detectTrackers(
  input: DetectionInput
): DetectionResult[] {
  return trackerLibrary
    .map((tracker) =>
      matchTracker(
        tracker,
        input
      )
    )
    .filter(
      (
        result
      ): result is DetectionResult =>
        result !== null
    );
}