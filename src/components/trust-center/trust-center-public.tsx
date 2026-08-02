import {
  ShieldCheck,
  FileText,
  ExternalLink,
  Lock,
  Mail,
  Award,
} from "lucide-react";
import type { TrustCenterDashboard } from "@/modules/trust-center/domain/trust-center-dashboard";

interface Props {
  company: {
    company_name: string;
    website?: string | null;
    slug?: string;
  };
  dashboard: TrustCenterDashboard;
}

export function TrustCenterPublic({ company, dashboard }: Props) {
  const score = dashboard.latestSummary?.dashboard.score ?? 100;
  const isHealthy = score >= 80;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* Top Banner Header */}
      <header className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Verified Enterprise Compliance Portal
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {company.company_name} Trust Center
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Statutory DPDP Act 2023 privacy disclosures, subprocessor agreements, and security certifications.
            </p>
          </div>

          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition border border-slate-700 shadow-sm"
            >
              Visit Company Website <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </header>

      {/* Main Content Container */}
      <div className="mx-auto max-w-5xl px-6 pt-10 space-y-8">
        {/* Compliance Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Privacy Audit Score</span>
              <ShieldCheck className={`h-5 w-5 ${isHealthy ? "text-emerald-500" : "text-amber-500"}`} />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {score} <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </div>
            <p className="text-xs text-slate-600">
              Evaluated based on telemetry controls, cookie banners, and statutory legal disclosures.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Data Protection Standard</span>
              <Lock className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="text-xl font-bold text-slate-900">DPDP Act 2023</div>
            <p className="text-xs text-slate-600">
              Aligned with Sections 6, 8, and 11-14 of India Statutory DPDP Law.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Certification</span>
              <Award className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-slate-900">SOC 2 Type II Ready</div>
            <p className="text-xs text-slate-600">
              Subprocessors undergo annual security vulnerability assessments.
            </p>
          </div>
        </div>

        {/* Legal Disclosures Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold text-slate-900">Published Statutory Notices</h2>
            <p className="text-xs text-slate-500">Official legal documents governing data principal rights and telemetry.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboard.disclosures?.privacyPolicy && (
              <div className="p-5 rounded-xl border border-slate-100 bg-slate-50 hover:border-slate-300 transition space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                    <FileText className="h-4 w-4" /> Privacy Policy
                  </div>
                  <span className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2 py-0.5 rounded">
                    v{dashboard.disclosures.privacyPolicy.version}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  Comprehensive notice on data inventory, legal grounds, retention periods, and DPO contacts.
                </p>
                <a
                  href={dashboard.disclosures.privacyPolicy.url || "#"}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View Policy <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {dashboard.disclosures?.cookiePolicy && (
              <div className="p-5 rounded-xl border border-slate-100 bg-slate-50 hover:border-slate-300 transition space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                    <FileText className="h-4 w-4" /> Cookie Policy
                  </div>
                  <span className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2 py-0.5 rounded">
                    v{dashboard.disclosures.cookiePolicy.version}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  Detailed breakdown of strictly necessary, functional, and marketing cookies.
                </p>
                <a
                  href={dashboard.disclosures.cookiePolicy.url || "#"}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View Policy <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* DPO Contact Box */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-400" /> Data Protection Officer (DPO)
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Exercise your Data Principal Rights under Sections 11-14 of the DPDP Act 2023 or report security vulnerabilities.
            </p>
          </div>
          <a
            href={`mailto:dpo@${company.website?.replace(/^https?:\/\//, "") || "company.com"}`}
            className="px-5 py-3 rounded-xl bg-white text-indigo-950 font-semibold text-sm hover:bg-indigo-50 transition shadow-sm whitespace-nowrap"
          >
            Contact DPO
          </a>
        </div>
      </div>
    </main>
  );
}
