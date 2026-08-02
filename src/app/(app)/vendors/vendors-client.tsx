"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Building2,
  FileCheck,
  Search,
  AlertTriangle,
  Globe2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createVendorRecordAction,
  deleteVendorRecordAction,
  confirmVendorAction,
} from "@/app/actions/vendors";

interface VendorItem {
  id: string;
  name: string;
  category: string;
  purpose?: string;
  data_categories: string[];
  data_received: string[];
  dpa_uploaded: boolean;
  dpa_url?: string;
  dpa_expiry?: string;
  country: string;
  scc_required: boolean;
  risk_rating?: "low" | "medium" | "high";
  last_review_at?: string;
  status?: "active" | "under_review" | "expired" | "terminated";
  scanner_discovered?: boolean;
  unconfirmed: boolean;
}

export function VendorRegistryClient({ initialVendors }: { initialVendors: VendorItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [now] = useState(() => Date.now());

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Analytics & Marketing");
  const [purpose, setPurpose] = useState("");
  const [categoriesInput] = useState("Browsing Behavior, Device Specs");
  const [receivedInput, setReceivedInput] = useState("IP Address, Cookie Token");
  const [dpaUploaded, setDpaUploaded] = useState(true);
  const [dpaUrl] = useState("");
  const [dpaExpiry] = useState("2027-12-31");
  const [country, setCountry] = useState("United States");
  const [sccRequired, setSccRequired] = useState(true);
  const [riskRating, setRiskRating] = useState<"low" | "medium" | "high">("low");

  const filteredVendors = initialVendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.country.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "unconfirmed") return matchesSearch && v.unconfirmed;
    if (statusFilter === "missing_dpa") return matchesSearch && !v.dpa_uploaded;
    if (statusFilter === "high_risk") return matchesSearch && v.risk_rating === "high";

    return matchesSearch;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      await createVendorRecordAction({
        name: name.trim(),
        category,
        purpose,
        data_categories: categoriesInput.split(",").map((s) => s.trim()).filter(Boolean),
        data_received: receivedInput.split(",").map((s) => s.trim()).filter(Boolean),
        dpa_uploaded: dpaUploaded,
        dpa_url: dpaUrl,
        dpa_expiry: dpaExpiry,
        country,
        scc_required: sccRequired,
      });

      setName("");
      setShowAddForm(false);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteVendorRecordAction(id);
      router.refresh();
    });
  };

  const handleConfirm = (id: string) => {
    startTransition(async () => {
      await confirmVendorAction(id);
      router.refresh();
    });
  };

  const missingDpaCount = initialVendors.filter((v) => !v.dpa_uploaded).length;
  const unconfirmedCount = initialVendors.filter((v) => v.unconfirmed).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-indigo-600" /> Vendor Registry & Subprocessor Governance
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track external data processors, execute DPAs, enforce Standard Contractual Clauses (SCCs), and audit vendor risks.
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Vendor Record
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-semibold uppercase text-slate-500">Total Processors</div>
          <div className="text-3xl font-extrabold text-slate-900">{initialVendors.length}</div>
          <p className="text-xs text-slate-500">Active Data Subprocessors</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-semibold uppercase text-slate-500">Unconfirmed (Scanner)</div>
          <div className="text-3xl font-extrabold text-amber-600">{unconfirmedCount}</div>
          <p className="text-xs text-slate-500">Discovered via Telemetry Audit</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-semibold uppercase text-slate-500">Missing Executed DPAs</div>
          <div className="text-3xl font-extrabold text-red-600">{missingDpaCount}</div>
          <p className="text-xs text-slate-500">Requires Legal Contract Signoff</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-semibold uppercase text-slate-500">Cross-Border Transfer</div>
          <div className="text-3xl font-extrabold text-indigo-600">
            {initialVendors.filter((v) => v.country !== "India").length}
          </div>
          <p className="text-xs text-slate-500">SCC Protections Enforced</p>
        </div>
      </div>

      {/* Add Vendor Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-md space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" /> Create Subprocessor & DPA Record
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-semibold">Vendor Name</Label>
              <Input
                placeholder="e.g. AWS, Razorpay, PostHog"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 text-sm"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Category</Label>
              <Input
                placeholder="e.g. Cloud Host, Payment Gateway"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Country / Region</Label>
              <Input
                placeholder="e.g. India, United States"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold">Data Received (Comma separated)</Label>
              <Input
                placeholder="IP Address, Email, Cookie Token"
                value={receivedInput}
                onChange={(e) => setReceivedInput(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Processing Purpose</Label>
              <Input
                placeholder="Hosting, Analytics, Payment Processing"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dpa"
                checked={dpaUploaded}
                onChange={(e) => setDpaUploaded(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="dpa" className="text-xs font-semibold cursor-pointer">Executed DPA on File</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="scc"
                checked={sccRequired}
                onChange={(e) => setSccRequired(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="scc" className="text-xs font-semibold cursor-pointer">Enforce Standard Contractual Clauses</Label>
            </div>

            <div>
              <Label className="text-xs font-semibold">Risk Rating</Label>
              <select
                value={riskRating}
                onChange={(e) => setRiskRating(e.target.value as "low" | "medium" | "high")}
                className="w-full mt-1 rounded-lg border border-slate-200 p-2 text-xs bg-white"
              >
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isPending ? "Saving..." : "Save Record"}
            </Button>
          </div>
        </form>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search processors by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["all", "unconfirmed", "missing_dpa", "high_risk"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition capitalize ${
                statusFilter === filter
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filter.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Table */}
      {filteredVendors.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-gray-500 bg-white">
          <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">No vendor registry records found.</p>
          <p className="text-xs text-gray-400 mt-1">Run a scanner audit or click &quot;Add Vendor Record&quot; above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">
              <tr>
                <th className="px-6 py-4">Vendor & Category</th>
                <th className="px-6 py-4">Data Received</th>
                <th className="px-6 py-4">DPA & Expiry Alert</th>
                <th className="px-6 py-4">Country & SCCs</th>
                <th className="px-6 py-4">Rating & Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {filteredVendors.map((vendor) => {
                const isExpiringSoon =
                  vendor.dpa_expiry &&
                  new Date(vendor.dpa_expiry).getTime() - now < 30 * 24 * 60 * 60 * 1000;

                return (
                  <tr
                    key={vendor.id}
                    className={
                      vendor.unconfirmed
                        ? "bg-amber-50/20 hover:bg-amber-50/30 transition-colors border-l-2 border-l-amber-500"
                        : "hover:bg-slate-50/50 transition-colors"
                    }
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="font-bold flex items-center gap-2">
                        {vendor.name}
                        {vendor.unconfirmed && (
                          <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                            Discovered
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{vendor.category}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {vendor.data_received.slice(0, 3).map((item, i) => (
                          <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {vendor.dpa_uploaded ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                            <FileCheck className="h-3 w-3" /> Executed DPA
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 text-[10px]">
                            <AlertTriangle className="h-3 w-3" /> DPA Missing
                          </span>
                        )}
                      </div>
                      {isExpiringSoon && (
                        <div className="text-[10px] font-bold text-amber-600 mt-1">Expiring Soon</div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1">
                        <Globe2 className="h-3.5 w-3.5 text-slate-400" /> {vendor.country}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {vendor.scc_required ? "SCC Clauses Enforced" : "Domestic Transfer"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase ${
                          vendor.risk_rating === "high"
                            ? "bg-red-100 text-red-700"
                            : vendor.risk_rating === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {vendor.risk_rating || "low"} risk
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      {vendor.unconfirmed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfirm(vendor.id)}
                          className="text-[11px] bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 h-7 px-2"
                        >
                          Confirm
                        </Button>
                      )}

                      {vendor.dpa_url && (
                        <a href={vendor.dpa_url} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="ghost" className="h-7 px-2">
                            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                        </a>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(vendor.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
