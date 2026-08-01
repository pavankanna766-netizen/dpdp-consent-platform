import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  ExternalLink,
  Lock,
  Globe2,
  Mail,
  Building2,
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
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner Header */}
      <header className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Live Operational Trust Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {company.company_name} Trust Center
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Official statutory compliance disclosures, subprocessor directory, security commitments, and DPDP Act 2023 verification portal.
            </p>
          </div>

          {/* Privacy Score Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-5 shrink-0 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Privacy Score</span>
            <div className={`text-4xl font-black ${isHealthy ? "text-emerald-400" : "text-amber-400"}`}>
              {score} <span className="text-lg font-bold text-slate-500">/ 100</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Verified Compliant
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        {/* Security Certifications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4 shadow-sm">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">DPDP Act 2023</h4>
              <p className="text-xs text-slate-500 mt-0.5">Statutory Notice Compliant</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4 shadow-sm">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">ISO 27001 Certified</h4>
              <p className="text-xs text-slate-500 mt-0.5">Information Security Standard</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4 shadow-sm">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">SOC 2 Type II</h4>
              <p className="text-xs text-slate-500 mt-0.5">Trust Services Criteria</p>
            </div>
          </div>
        </div>

        {/* Statutory Policy Disclosures */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" /> Published Disclosures & Statutory Notices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Privacy Policy Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Privacy Policy</h4>
                  <p className="text-xs text-slate-500 mt-1">Data processing notice & rights disclosures.</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${dashboard.privacy ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                  {dashboard.privacy ? "Published" : "Pending"}
                </span>
              </div>
              {company.slug && (
                <a
                  href={`/p/${company.slug}/privacy`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  View Statutory Notice <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {/* Cookie Policy Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Cookie Policy</h4>
                  <p className="text-xs text-slate-500 mt-1">Cookie categories & tracker disclosures.</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${dashboard.cookies ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                  {dashboard.cookies ? "Published" : "Pending"}
                </span>
              </div>
              {company.slug && (
                <a
                  href={`/p/${company.slug}/cookies`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  View Statutory Notice <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Security & DPO Contacts */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-2">
              <Mail className="h-4 w-4 text-indigo-600" /> Data Protection Officer & Grievance Contact
            </h4>
            <p className="text-xs text-indigo-800">
              For privacy inquiries, grievance redressal, or exercising your Data Principal rights under DPDP Act Section 13.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs font-bold text-indigo-950">privacy@{company.website ? new URL(company.website).hostname.replace(/^www\./, "") : "company.com"}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
