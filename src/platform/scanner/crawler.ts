import type {
  ScanResult,
} from "./types";

export interface WebsiteCrawler {
  crawl(
    url: string
  ): Promise<ScanResult[]>;
}