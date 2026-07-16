import type {
  PrivacyPolicy,
} from "../domain/privacy-policy";

import {
  policyComposerService,
} from "./policy-composer.service";

import {
  sectionLibraryService,
} from "./section-library.service";

import type {
  LegalProfile,
} from "../domain/legal-profile";

export class PrivacyPolicyService {
  generate(

  profile: LegalProfile

): PrivacyPolicy {
  const sections = [
  {
    ...sectionLibraryService.get(
      "intro"
    )!,
    content: `${profile.companyName} values your privacy and is committed to protecting your personal data.`,
  },
  {
    ...sectionLibraryService.get(
      "collection"
    )!,
    content:
      "We collect information you voluntarily provide as well as technical information required to operate our services.",
  },
  {
    ...sectionLibraryService.get(
      "usage"
    )!,
    content:
      "We process personal data to provide services, improve our platform, comply with legal obligations and communicate with users.",
  },
  {
    ...sectionLibraryService.get(
      "rights"
    )!,
    content:
      "Users may request access, correction, deletion or withdrawal of consent as permitted under applicable law.",
  },
  {
    ...sectionLibraryService.get(
      "contact"
    )!,
    content: `For privacy enquiries contact ${profile.companyName}.`,
  },
];

  return {
    title: "Privacy Policy",

    version: "1.0",

    jurisdiction: profile.country,

    sections:
      policyComposerService.compose(
        sections
      ),
  };
}
}

export const privacyPolicyService =
  new PrivacyPolicyService();