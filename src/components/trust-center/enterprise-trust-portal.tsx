"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Mail,
  Award,
  ExternalLink,
  CheckCircle2,
  Search,
  Copy,
  Check,
  FileText,
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
    showVendors: boolean;
    showInventory: boolean;
    securityTxtContent: string;
    faqItems: Array<{ question: string; answer: string }>;
  };
  metrics: {
    privacyScore: number;
    activeConsents: number;
    completedScans: number;
    lastAuditDate: string;
  };
  disclosures: {
    privacyPolicy?: { version: number; publishedAt: string; url: string } | null;
    cookiePolicy?: { version: number; publishedAt: string; url: string } | null;
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
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {trustPortal.systemStatus === "operational" ? "All Systems Operational" : "Compliance Audit Active"}
            </div>
            <div className="flex items-center gap-4">
              {trustPortal.logoUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={trustPortal.logoUrl} alt={company.company_name} className="h-10 object-contain" />
              )}
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                {company.company_name} Trust Center
              </h1>
            </div>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {trustPortal.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleCopyLink} variant="outline" className="bg-slate-900 border-slate-700 text-white hover:bg-slate-800">
              {copied ? <Check className="h-4 w-4 mr-2 text-emerald-400" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Link Copied!" : "Share Trust Portal"}
            </Button>
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
                  Visit Website <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-6xl px-6 flex items-center gap-1 overflow-x-auto py-2">
          {(["overview", "policies", "security", "vendors", "inventory", "status", "security_txt", "faq"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition whitespace-nowrap capitalize ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.replace("_", ".")}
            </button>
          ))}
        </div>
      </div>

      {/* Content Panels */}
      <div className="mx-auto max-w-6xl px-6 pt-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Score Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                  <span>Privacy Score</span>
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900">{metrics.privacyScore} / 100</div>
                <p className="text-xs text-slate-500">Statutory DPDP Audit Score</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                  <span>Active Consents</span>
                  <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900">{metrics.activeConsents.toLocaleString()}</div>
                <p className="text-xs text-slate-500">Logged Consent Receipts</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                  <span>Subprocessors</span>
                  <Lock className="h-5 w-5 text-amber-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900">{subprocessors.length}</div>
                <p className="text-xs text-slate-500">Executed DPAs & SCCs</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                  <span>Audit Date</span>
                  <Award className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="text-sm font-bold text-slate-900 mt-2">
                  {new Date(metrics.lastAuditDate).toLocaleDateString("en-IN")}
                </div>
                <p className="text-xs text-slate-500">Automated Scan Completed</p>
              </div>
            </div>

            {/* DPO Contact Card */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Mail className="h-6 w-6 text-indigo-400" /> Data Protection Officer (DPO)
                </h3>
                <p className="text-sm text-slate-300 max-w-2xl">
                  {trustPortal.dpoName} serves as the designated Data Protection Officer. Exercise your rights under Section 11-14 of the DPDP Act 2023.
                </p>
              </div>
              <a href={`mailto:${trustPortal.dpoEmail}`}>
                <Button className="bg-white text-slate-950 hover:bg-slate-100 font-semibold px-6 py-3">
                  Email DPO
                </Button>
              </a>
            </div>
          </div>
        )}

        {activeTab === "policies" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Published Statutory Notices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {disclosures.privacyPolicy && (
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600" /> Privacy Policy
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      v{disclosures.privacyPolicy.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">Published: {new Date(disclosures.privacyPolicy.publishedAt).toLocaleDateString()}</p>
                  <a href={disclosures.privacyPolicy.url} className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                    View Policy <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {disclosures.cookiePolicy && (
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600" /> Cookie Policy
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      v{disclosures.cookiePolicy.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">Published: {new Date(disclosures.cookiePolicy.publishedAt).toLocaleDateString()}</p>
                  <a href={disclosures.cookiePolicy.url} className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                    View Policy <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "vendors" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Authorized Subprocessors</h2>
                <p className="text-xs text-slate-500">Subprocessors engaged for personal data storage and processing.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
              {filteredVendors.map((v, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-bold text-slate-900">{v.name}</div>
                    <div className="text-xs text-slate-500">{v.category} • {v.country}</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {v.dpaStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Data Inventory Summary</h2>
                <p className="text-xs text-slate-500">Categories of personal data processed and statutory retention periods.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search data categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
              {filteredInventory.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.data_category} • Purpose: {item.purpose}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-700">Retention: {item.retention_period}</div>
                    <div className="text-xs text-slate-400">Ground: {item.legal_basis}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
