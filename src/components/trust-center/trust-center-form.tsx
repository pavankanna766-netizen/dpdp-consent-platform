"use client";

import { useState } from "react";
import { updateCompanyAction } from "@/app/actions/company";

interface TrustCenterDashboard {
  company: {
    id: string;
    company_name: string;
    website: string | null;
    slug: string;
    industry: string;
    company_size: string;
    country: string;
    timezone: string;
    is_onboarded: boolean;
  };
  trustCenter: {
    headline: string | null;
    description: string | null;
  };
  latestSummary: {
    scan: {
      completed_at?: string;
      started_at?: string;
      cookies_found?: number;
      trackers_found?: number;
      findings_count?: number;
    } | null;
    dashboard: {
      score: number;
    };
  } | null;
  privacyScore: number;
  privacy: {
    id: string;
    status: string;
    version: number;
  } | null;
  cookies: {
    id: string;
    status: string;
    version: number;
  } | null;
  banner: {
    id: string;
    name: string;
    status: string;
    embed_token: string;
    consent_expiry_days: number;
  } | null;
  publicLinks: {
    privacyPolicy: string | null;
    cookiePolicy: string | null;
    trustCenter: string | null;
  };
}

interface Props {
  company: TrustCenterDashboard["company"];
  dashboard: TrustCenterDashboard;
}

export function TrustCenterForm({
  company: initialCompany,
  dashboard,
}: Props) {
  const [company, setCompany] = useState(initialCompany);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState(company.company_name);
  const [website, setWebsite] = useState(company.website ?? "");
  const [industry, setIndustry] = useState(company.industry ?? "");
  const [companySize, setCompanySize] = useState(company.company_size ?? "");
  const [country, setCountry] = useState(company.country ?? "");
  const [timezone, setTimezone] = useState(company.timezone ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const updated = await updateCompanyAction({
        company_name: companyName,
        website: website || null,
        industry,
        company_size: companySize,
        country,
        timezone,
        is_onboarded: company.is_onboarded,
      });

      setCompany(updated);
      setSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to update company information";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const latestScanDate = dashboard.latestSummary?.scan?.completed_at
    ? new Date(dashboard.latestSummary.scan.completed_at).toLocaleDateString()
    : null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Trust Center & Compliance
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Monitor your DPDP compliance health and manage public policies and legal information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Editable Company Profile */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
            <p className="mt-1 text-xs text-gray-500">
              Update legal settings displayed on your public policies and trust page.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">Company Size</label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select size...</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">Timezone</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {success && (
                <p className="text-xs font-medium text-green-600">
                  ✓ Company details updated successfully.
                </p>
              )}

              {error && (
                <p className="text-xs font-medium text-red-600">
                  ✗ {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Columns: Read-Only Compliance Dashboard */}
        <div className="space-y-6 lg:col-span-2">
          {/* Top compliance metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Privacy Score</span>
              <div className="mt-2 flex items-baseline">
                <span className="text-4xl font-extrabold tracking-tight text-blue-600">
                  {dashboard.privacyScore}
                </span>
                <span className="ml-1 text-sm text-gray-500">/ 100</span>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Scanner Status</span>
              <div className="mt-2">
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  Active
                </span>
                <p className="mt-2 text-xs text-gray-500">
                  {latestScanDate ? `Latest scan completed on ${latestScanDate}` : "No scans completed yet"}
                </p>
              </div>
            </div>
          </div>

          {/* Compliance Items Status */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Compliance Modules</h3>
            <p className="text-xs text-gray-500">Overview of active consent, documents and banner scripts.</p>

            <div className="mt-6 divide-y divide-gray-200">
              {/* Privacy Policy */}
              <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Privacy Policy Document</h4>
                  <p className="text-xs text-gray-500">
                    {dashboard.privacy
                      ? `Published (Version ${dashboard.privacy.version || "1.0"})`
                      : "No active privacy policy published"}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    dashboard.privacy
                      ? "bg-green-50 text-green-700 ring-green-600/20"
                      : "bg-red-50 text-red-700 ring-red-600/20"
                  }`}>
                    {dashboard.privacy ? "Published" : "Missing"}
                  </span>
                  {dashboard.publicLinks.privacyPolicy && (
                    <a
                      href={dashboard.publicLinks.privacyPolicy}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View Policy ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Cookie Policy */}
              <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Cookie Policy Document</h4>
                  <p className="text-xs text-gray-500">
                    {dashboard.cookies
                      ? `Published (Version ${dashboard.cookies.version || "1.0"})`
                      : "No active cookie policy published"}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    dashboard.cookies
                      ? "bg-green-50 text-green-700 ring-green-600/20"
                      : "bg-red-50 text-red-700 ring-red-600/20"
                  }`}>
                    {dashboard.cookies ? "Published" : "Missing"}
                  </span>
                  {dashboard.publicLinks.cookiePolicy && (
                    <a
                      href={dashboard.publicLinks.cookiePolicy}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View Policy ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Consent Banner */}
              <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Cookie Consent Banner</h4>
                  <p className="text-xs text-gray-500">
                    {dashboard.banner
                      ? `Active: "${dashboard.banner.name}"`
                      : "No consent banner configured"}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    dashboard.banner
                      ? "bg-green-50 text-green-700 ring-green-600/20"
                      : "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                  }`}>
                    {dashboard.banner ? "Active" : "Inactive"}
                  </span>
                  {dashboard.banner && (
                    <span className="text-xs text-gray-400 select-all font-mono">
                      Token: {dashboard.banner.embed_token.substring(0, 8)}...
                    </span>
                  )}
                </div>
              </div>

              {/* Latest Scan details */}
              <div className="py-4">
                <h4 className="text-sm font-medium text-gray-900">Latest Compliance Scan Findings</h4>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg border bg-gray-50 p-2">
                    <span className="block font-bold text-gray-700">
                      {dashboard.latestSummary?.scan?.cookies_found ?? 0}
                    </span>
                    <span className="text-gray-500">Cookies</span>
                  </div>
                  <div className="rounded-lg border bg-gray-50 p-2">
                    <span className="block font-bold text-gray-700">
                      {dashboard.latestSummary?.scan?.trackers_found ?? 0}
                    </span>
                    <span className="text-gray-500">Trackers</span>
                  </div>
                  <div className="rounded-lg border bg-gray-50 p-2">
                    <span className="block font-bold text-gray-700">
                      {dashboard.latestSummary?.scan?.findings_count ?? 0}
                    </span>
                    <span className="text-gray-500">Findings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Public Trust Links */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Public Compliance Center</h3>
            <p className="text-xs text-gray-500">Direct links to your public-facing compliance and policies center.</p>

            <div className="mt-4 space-y-2">
              {dashboard.publicLinks.trustCenter && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-xs font-semibold text-gray-700">Trust Center Hub</span>
                  <a
                    href={dashboard.publicLinks.trustCenter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  >
                    Open Trust Page ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}