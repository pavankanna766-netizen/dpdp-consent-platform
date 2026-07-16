export interface CookiePolicy {
  title: string;

  version: string;

  sections: {
    id: string;

    title: string;

    content: string;
  }[];
}