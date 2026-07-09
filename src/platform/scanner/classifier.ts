import type {
  ScanResult,
} from "./types";

export interface CookieClassifier {
  classify(
    cookies: ScanResult[]
  ): Promise<ScanResult[]>;
}