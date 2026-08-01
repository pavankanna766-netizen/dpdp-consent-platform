"use client";

import { useState } from "react";
import {
  ShieldCheck,
  FileText,
  Lock,
  Globe,
  Mail,
  Award,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  HelpCircle,
  Search,
  Share2,
  Download,
  Building2,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VendorItem {
  name: string;
  category: string;
  country: string;
  dpaStatus: string;
  sccEnforced: boolean;
}

interface InventoryItem {
  name: string;
  data_category: string;
  purpose: string;
  retention_period: string;
  legal_basis: string;
}

interface Props {
  company: {
    company_name: string;
    website?: string | null;
    slug?: string;
  };
  trustPortal: {
    headline: string;
    description: string;
    brandColor: string;
    logoUrl?: string | null;
    securityEmail: string;
    dpoName: string;
    dpoEmail: string;
    certifications: string[];
    systemStatus: string;
    showVendors?: boolean;
    showInventory?: boolean;
    securityTxtContent?: string;
    faqItems?: Array<{ question: string; answer: string }>;
  };
  metrics: {
    privacyScore: number;
    activeConsents: number;
    completedScans: number;
    lastAuditDate: string;
  };
  disclosures: {
    privacyPolicy: { version: number; publishedAt: string | null; url: string } | null;
    cookiePolicy: { version: number; publishedAt: string | null; url: string } | null;
  };
  subprocessors: VendorItem[];
  inventory: InventoryItem[];
}

export function EnterpriseTrustPortal({
  company,
  trustPortal,
  metrics,
  disclosures,
  subprocessors,
  inventory,
}: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "policies" | "security" | "vendors" | "inventory" | "status" | "security_txt" | "faq">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredVendors = subprocessors.filter(
    (v) => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInventory = inventory.filter(
    (i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.data_category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Dark Enterprise Hero Header */}
      <header className="bg-slate-950 text-white py-14 border-b border-slate-800 relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Operational System Status: {trustPortal.systemStatus.toUpperCase()}
            </div>

            <div className="flex items-center gap-4">
              {trustPortal.logoUrl && (
                <img src={trustPortal.logoUrl} alt={company.company_name} className="h-12 object-contain bg-white/5 p-1 rounded-lg" />
              )}
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">{company.company_name} Trust Center</h1>
            </div>

            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
              {trustPortal.description || "Official statutory compliance disclosures, subprocessor registry, security commitments, and DPDP Act 2023 verification portal."}
            </p>
          </div>

          {/* Privacy Score & Share Card */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center space-y-1 w-48 shadow-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Privacy Audit Score</span>
              <div className="text-4xl font-black text-emerald-400">
                {metrics.privacyScore} <span className="text-lg font-bold text-slate-500">/ 100</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> DPDP Compliant
              </div>
            </div>

            <Button size="sm" variant="outline" onClick={handleCopyLink} className="text-xs border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 w-48">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
              {copied ? "Link Copied!" : "Share Trust Portal"}
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Header */}
      <nav className="bg-white border-b sticky top-0 z-20 shadow-2xs">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between overflow-x-auto">
          <div className="flex gap-1 py-3">
            {[
              { id: "overview", label: "Trust Overview" },
              { id: "policies", label: "Statutory Policies" },
              { id: "security", label: "Security & Audits" },
              { id: "vendors", label: "Subprocessors" },
              { id: "inventory", label: "Data Inventory" },
              { id: "status", label: "System Status" },
              { id: "security_txt", label: "RFC 9116 security.txt" },
              { id: "faq", label: "FAQ" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 w-64">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute ml-3 pointer-events-none" />
            <Input
              placeholder="Search portal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs pl-9"
            />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-10">
            {/* Certifications Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">DPDP Act 2023</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Statutory Notice Compliant</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">ISO 27001 Certified</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Information Security Standard</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">SOC 2 Type II</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Trust Services Criteria</p>
                </div>
              </div>
            </div>

            {/* DPO & Contact Box */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-indigo-950 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-indigo-600" /> Data Protection Officer & Grievance Contact
                </h4>
                <p className="text-xs text-indigo-800">
                  For privacy inquiries, grievance redressal, or exercising Data Principal rights under DPDP Act Section 13.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-black text-indigo-950 block">{trustPortal.dpoName}</span>
                <span className="text-xs font-mono font-bold text-indigo-600">{trustPortal.dpoEmail}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: POLICIES */}
        {activeTab === "policies" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Privacy Policy</h4>
                  <p className="text-xs text-slate-500 mt-1">Statutory data processing notice & rights disclosures.</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${disclosures.privacyPolicy ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                  {disclosures.privacyPolicy ? "Published" : "Pending"}
                </span>
              </div>
              {company.slug && (
                <a
                  href={`/p/${company.slug}/privacy`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  View Published Notice <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Cookie Policy</h4>
                  <p className="text-xs text-slate-500 mt-1">Cookie categories & tracker disclosures.</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${disclosures.cookiePolicy ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                  {disclosures.cookiePolicy ? "Published" : "Pending"}
                </span>
              </div>
              {company.slug && (
                <a
                  href={`/p/${company.slug}/cookies`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  View Published Notice <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: VENDORS */}
        {activeTab === "vendors" && (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-slate-900">Authorized Subprocessors</h3>
              <p className="text-xs text-slate-500 mt-1">List of third-party data processors with executed DPA agreements.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="p-4">Processor Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Country</th>
                    <th className="p-4">DPA Safeguard</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredVendors.map((v, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-900">{v.name}</td>
                      <td className="p-4">{v.category}</td>
                      <td className="p-4">{v.country}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                          <CheckCircle2 className="h-3 w-3" /> {v.dpaStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: RFC 9116 SECURITY.TXT */}
        {activeTab === "security_txt" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">RFC 9116 security.txt Disclosure</h3>
                <p className="text-xs text-slate-500 mt-0.5">Standardized vulnerability disclosure contact specification.</p>
              </div>
            </div>
            <pre className="rounded-xl bg-slate-900 text-emerald-400 p-6 text-xs font-mono overflow-x-auto leading-relaxed">
              {trustPortal.securityTxtContent || `Contact: mailto:${trustPortal.securityEmail}\nExpires: 2027-12-31T23:59:59.000Z\nPreferred-Languages: en\nCanonical: https://privystack.com/trust/${company.slug}`}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
