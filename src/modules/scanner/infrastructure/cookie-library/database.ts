import {
  analyticsCookies,
} from "./analytics";

import {
  marketingCookies,
} from "./marketing";

import {
  infrastructureCookies,
} from "./infrastructure";

export const cookieDatabase = [
  ...analyticsCookies,

  ...marketingCookies,

  ...infrastructureCookies,
];