import type {
  ComplianceStatus,
} from "../domain/compliance-status";

export class ProgressService {
  calculate(
    items: ComplianceStatus[]
  ) {
    if (items.length === 0) {
      return 0;
    }

    const completed =
      items.filter(
        (item) =>
          item.completed
      ).length;

    return Math.round(
      (completed /
        items.length) *
        100
    );
  }
}

export const progressService =
  new ProgressService();