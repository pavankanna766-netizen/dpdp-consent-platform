export const siteConfig = {
  name: "PrivyStack",
  shortName: "PrivyStack",
  description:
    "A modern SaaS platform helping Indian businesses comply with the Digital Personal Data Protection (DPDP) Act through consent management and audit-ready records.",

  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  links: {
    github: "",
    documentation: "",
  },
} as const;