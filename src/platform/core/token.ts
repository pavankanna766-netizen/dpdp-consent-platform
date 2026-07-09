import { randomBytes } from "crypto";

export function generatePublicToken(
  length = 24
) {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

  const bytes = randomBytes(length);

  let token = "";

  for (let i = 0; i < length; i++) {
    token +=
      alphabet[
        bytes[i] % alphabet.length
      ];
  }

  return token;
}