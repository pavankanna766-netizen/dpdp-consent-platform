import type {
  DetectionInput,
  DetectionResult,
} from "./detection";

export interface TrackerDetector {
  readonly id: string;

  detect(
    input: DetectionInput
  ): DetectionResult | null;
}