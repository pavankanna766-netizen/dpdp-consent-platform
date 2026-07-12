import {
  cookieDatabase,
} from "../infrastructure/cookie-library/database";

export function classifyCookie(
  cookieName: string
) {
  const normalized =
    cookieName.toLowerCase();

  const definition =
    cookieDatabase.find(
      (cookie) => {
        const pattern =
          cookie.pattern
            .toLowerCase()
            .replace(
              /\*/g,
              ".*"
            );

        return new RegExp(
          `^${pattern}$`,
          "i"
        ).test(normalized);
      }
    );

  return {
    category:
      definition?.category ??
      "unknown",

    provider:
      definition?.provider,

    purpose:
      definition?.purpose,

    consentRequired:
      definition?.consentRequired,

    typicalDuration:
      definition?.typicalDuration,

    party:
      definition?.party,
  };
}