export interface PrivyStackConfig {
  token: string;

  apiBaseUrl?: string;

  language?: string;

  theme?: "light" | "dark";
}

export interface ConsentCategories {
  analytics: boolean;

  marketing: boolean;

  preferences: boolean;
}