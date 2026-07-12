import type {
  ScanChange,
} from "../domain/change";

export class ChangeDetector {
  compare(
    currentScore: number,
    previousScore: number | null
  ): ScanChange[] {
    const changes: ScanChange[] = [];

    if (
      previousScore === null
    ) {
      return changes;
    }

    if (
      currentScore >
      previousScore
    ) {
      changes.push({
        type: "changed",

        severity: "low",

        title:
          "Privacy score improved",

        description:
          `Score increased from ${previousScore} to ${currentScore}.`,
      });
    }

    if (
      currentScore <
      previousScore
    ) {
      changes.push({
        type: "changed",

        severity: "high",

        title:
          "Privacy score decreased",

        description:
          `Score dropped from ${previousScore} to ${currentScore}.`,
      });
    }

    return changes;
  }
}

export const changeDetector =
  new ChangeDetector();

  export {
  changeComparator,
} from "./change-comparator";