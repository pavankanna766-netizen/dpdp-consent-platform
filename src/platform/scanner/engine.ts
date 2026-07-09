import type {
  ScanRequest,
  WebsiteScan,
} from "./types";

export class ScannerEngine {
  async scan(
    request: ScanRequest
  ): Promise<WebsiteScan> {
    throw new Error(
      "ScannerEngine.scan() not implemented."
    );
  }
}

export const scannerEngine =
  new ScannerEngine();