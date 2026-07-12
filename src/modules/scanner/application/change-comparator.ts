import type {
  DetectionResult,
} from "../domain/detection";

import type {
  ComplianceFinding,
} from "../domain/compliance-rule";

import type {
  ScanChange,
} from "../domain/change";

export class ChangeComparator {
  compare(
    previous: {
      detections: DetectionResult[];

      findings: ComplianceFinding[];
    },

    current: {
      detections: DetectionResult[];

      findings: ComplianceFinding[];
    }
  ): ScanChange[] {
    const changes: ScanChange[] =
      [];

    const previousTrackers =
      new Set(
        previous.detections.map(
          (d) =>
            d.tracker.provider
        )
      );

    const currentTrackers =
      new Set(
        current.detections.map(
          (d) =>
            d.tracker.provider
        )
      );

    currentTrackers.forEach(
      (tracker) => {
        if (
          !previousTrackers.has(
            tracker
          )
        ) {
          changes.push({
            type:
              "added",

            severity:
              "medium",

            title:
              "Tracker Added",

            description:
              tracker,
          });
        }
      }
    );

    previousTrackers.forEach(
      (tracker) => {
        if (
          !currentTrackers.has(
            tracker
          )
        ) {
          changes.push({
            type:
              "removed",

            severity:
              "low",

            title:
              "Tracker Removed",

            description:
              tracker,
          });
        }
      }
    );

    return changes;
  }
}

export const changeComparator =
  new ChangeComparator();