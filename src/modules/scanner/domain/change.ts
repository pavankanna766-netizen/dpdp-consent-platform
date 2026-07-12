export interface ScanChange {
  type:
    | "added"
    | "removed"
    | "changed";

  severity:
    | "low"
    | "medium"
    | "high";

  title: string;

  description: string;
}