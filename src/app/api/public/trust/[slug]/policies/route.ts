import { NextResponse } from "next/server";
import { getCompanyBySlug } from "@/repositories/company-slug.repository";
import { getPublishedPrivacyPolicy } from "@/repositories/privacy-policy.repository";
import { getPublishedCookiePolicy } from "@/repositories/cookie-policy.repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const companyRes = await getCompanyBySlug(slug);
    if (!companyRes.data) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const companyId = companyRes.data.id;
    const [privacyRes, cookieRes] = await Promise.all([
      getPublishedPrivacyPolicy(companyId),
      getPublishedCookiePolicy(companyId),
    ]);

    return NextResponse.json({
      privacyPolicy: privacyRes.data
        ? { version: privacyRes.data.version, publishedAt: privacyRes.data.published_at, url: `/p/${slug}/privacy` }
        : null,
      cookiePolicy: cookieRes.data
        ? { version: cookieRes.data.version, publishedAt: cookieRes.data.published_at, url: `/p/${slug}/cookies` }
        : null,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
