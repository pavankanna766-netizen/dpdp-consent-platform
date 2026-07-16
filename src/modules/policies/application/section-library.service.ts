import type {
  PolicySection,
} from "../domain/policy-section";

export class SectionLibraryService {
  private readonly sections: PolicySection[] = [
    {
      id: "intro",
      title: "Introduction",
      required: true,
      content: "",
    },
    {
      id: "collection",
      title: "Information We Collect",
      required: true,
      content: "",
    },
    {
      id: "usage",
      title: "How We Use Information",
      required: true,
      content: "",
    },
    {
      id: "rights",
      title: "Your Rights",
      required: true,
      content: "",
    },
    {
      id: "contact",
      title: "Contact",
      required: true,
      content: "",
    },
  ];

  getAll() {
    return this.sections;
  }

  get(
    id: string
  ) {
    return this.sections.find(
      (section) =>
        section.id === id
    );
  }
}

export const sectionLibraryService =
  new SectionLibraryService();