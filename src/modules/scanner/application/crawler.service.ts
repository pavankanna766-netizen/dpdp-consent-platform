import {
  crawlWebsite,
  type CrawlResult,
} from "../infrastructure/playwright/crawler";

export class CrawlerService {
  async crawl(
    url: string
  ): Promise<CrawlResult> {
    return crawlWebsite(url);
  }
}

export const crawlerService =
  new CrawlerService();