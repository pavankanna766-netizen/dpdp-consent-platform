import type {
  PrivyStackConfig,
} from "./types";

export const defaultConfig: Required<
  PrivyStackConfig
> = {
  token: "",

  apiBaseUrl:
    "/api/public",

  language: "en",

  theme: "light",
};