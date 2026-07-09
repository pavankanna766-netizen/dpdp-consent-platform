import { env } from "./env";

export const sdkConfig = {
  apiBaseUrl:
    env.nextPublicPrivyStackApi,

  templateToken:
    env.nextPublicTemplateToken,
};