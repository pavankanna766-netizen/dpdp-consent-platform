export type ScanStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed";

export type CookieCategory =
  | "necessary"
  | "analytics"
  | "marketing"
  | "preferences"
  | "unknown";

export interface ScanRequest {
  companyId: string;
  url: string;
}

export interface CookieInfo {
  name: string;
  value?: string;
  domain: string;
  path: string;
  expires?: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: string;
  category: CookieCategory;
  provider?: string;
}

export interface WebsiteScan {
  id: string;

  companyId: string;

  url: string;

  status: ScanStatus;

  startedAt?: Date;

  completedAt?: Date;

  results: CookieInfo[];

  scripts: string[];

  requests: string[];
}