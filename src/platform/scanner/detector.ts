import type {
  ScanResult,
} from "./types";

export interface TrackerDetector {
  detect(
    cookies: ScanResult[]
  ): Promise<ScanResult[]>;
}