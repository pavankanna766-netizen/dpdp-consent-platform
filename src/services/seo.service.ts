import type { Metadata } from "next";

export interface SeoPortalOptions {
  companyName: string;
  slug: string;
  description: string;
  brandColor?: string;
  logoUrl?: string | null;
}

export class SeoService {
  generateTrustCenterMetadata(options: SeoPortalOptions): Metadata {
    const title = `${options.companyName} Trust Center & Security Portal | PrivyStack`;
    const description = options.description || `Official DPDP Act 2023 statutory privacy disclosures, security certifications, and subprocessor registry for ${options.companyName}.`;
    const canonicalUrl = `https://privystack.com/trust/${options.slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: `${options.companyName} Trust Center`,
        images: [
          {
            url: options.logoUrl || "https://privystack.com/og-trust-center.png",
            width: 1200,
            height: 630,
            alt: `${options.companyName} Trust Center Badge`,
          },
        ],
        locale: "en_US",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [options.logoUrl || "https://privystack.com/og-trust-center.png"],
      },
      other: {
        "theme-color": options.brandColor || "#4f46e5",
      },
    };
  }

  generateJsonLd(options: SeoPortalOptions): string {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: options.companyName,
      url: `https://privystack.com/trust/${options.slug}`,
      logo: options.logoUrl || undefined,
      knowsAbout: [
        "Digital Personal Data Protection Act 2023",
        "Information Security",
        "ISO 27001",
        "SOC 2 Type II",
      ],
    };

    return JSON.stringify(jsonLd);
  }
}

export const seoService = new SeoService();
