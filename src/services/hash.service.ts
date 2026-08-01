import { createHash } from "crypto";

export class HashService {
  computeDocumentHash(htmlContent: string): string {
    if (!htmlContent) return createHash("sha256").update("").digest("hex");
    return createHash("sha256").update(htmlContent, "utf8").digest("hex");
  }

  verifyHashMatch(currentHtml: string, expectedHash: string): boolean {
    const currentHash = this.computeDocumentHash(currentHtml);
    return currentHash === expectedHash;
  }
}

export const hashService = new HashService();
