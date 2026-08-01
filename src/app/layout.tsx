import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

import "./globals.css";

import { ConsentController } from "@/components/consent/controller";
import { SdkProvider } from "@/components/sdk/sdk-provider";
import { siteConfig } from "../config/site";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
    >
      <body className="min-h-full flex flex-col font-sans">
        <ClerkProvider>
          <QueryProvider>
            <SdkProvider>
              {children}
              <ConsentController />
            </SdkProvider>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}