import crypto from "crypto";

export class SlugService {
  generate(
    name: string
  ) {
    const base = name
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /(^-|-$)/g,
        "");

    const suffix =
      crypto
        .randomBytes(2)
        .toString("hex");

    return `${base}-${suffix}`;
  }
}

export const slugService =
  new SlugService();