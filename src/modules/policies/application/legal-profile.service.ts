import type {
  LegalProfile,
} from "../domain/legal-profile";

export class LegalProfileService {
  create(
    profile: LegalProfile
  ): LegalProfile {
    return {
      ...profile,

      lastUpdated:
        new Date().toISOString(),
    };
  }
}

export const legalProfileService =
  new LegalProfileService();