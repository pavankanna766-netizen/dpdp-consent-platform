import {
  detectCMP,
} from "../infrastructure/cmp-library/detector";

import type {
  CrawlResult,
} from "../infrastructure/playwright/crawler";

export class CMPService {
  detect(
    crawl: CrawlResult
  ) {
    return detectCMP(
      crawl.scripts,
      crawl.requests
    );
  }
}

export const cmpService =
  new CMPService();