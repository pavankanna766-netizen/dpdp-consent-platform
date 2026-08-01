"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Building2,
  FileCheck,
  Search,
  Upload,
  AlertTriangle,
  Globe2,
  Sparkles,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createVendorAction,
  updateVendorAction,
  deleteVendorAction,
} from "./actions";

interface VendorItem {
  id: string;
  name: string;
  category?: string;
  purpose: string;
  data_categories: string[];
  data_received?: string[];
  dpa_uploaded?: boolean;
  dpa_url?: string | null;
  dpa_expiry?: string | null;
  country?: string;
  scc_required?: boolean;
  security_rating?: "A+" | "A" | "B" | "C" | "F";
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

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Analytics & Marketing");
  const [purpose, setPurpose] = useState("");
  const [categoriesInput, setCategoriesInput] = useState("Browsing Behavior, Device Specs");
  const [receivedInput, setReceivedInput] = useState("IP Address, Cookie Token");
  const [dpaUploaded, setDpaUploaded] = useState(true);
  const [dpaUrl, setDpaUrl] = useState("");
  const [dpaExpiry, setDpaExpiry] = useState("2027-12-31");
  const [country, setCountry] = useState("United States");
  const [sccRequired, setSccRequired] = useState(true);
  const [securityRating, setSecurityRating] = useState<"A+" | "A" | "B" | "C" | "F">("A");

  const filteredVendors = initialVendors.filter((vendor) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      vendor.name.toLowerCase().includes(q) ||
      vendor.purpose.toLowerCase().includes(q) ||
      (vendor.category && vendor.category.toLowerCase().includes(q)) ||
      (vendor.country && vendor.country.toLowerCase().includes(q)) ||
      vendor.data_categories.some((c) => c.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === "all" || (vendor.status || "active").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleConfirmVendor = (vendorId: string) => {
    startTransition(async () => {
      await updateVendorAction(vendorId, {
        unconfirmed: false,
        status: "active",
      });
      router.refresh();
    });
  };

  const handleDelete = (vendorId: string) => {
    if (!confirm("Are you sure you want to delete this vendor record?")) return;
    startTransition(async () => {
      await deleteVendorAction(vendorId);
      router.refresh();
    });
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !purpose) return;

    startTransition(async () => {
      const cats = categoriesInput.split(",").map((c) => c.trim()).filter(Boolean);
      const recs = receivedInput.split(",").map((r) => r.trim()).filter(Boolean);

      await createVendorAction({
        name,
        category,
        purpose,
        data_categories: cats,
        data_received: recs,
        dpa_uploaded: dpaUploaded,
        dpa_url: dpaUrl || undefined,
        dpa_expiry: dpaExpiry ? new Date(dpaExpiry).toISOString() : undefined,
        country,
        scc_required: sccRequired,
        security_rating: securityRating,
        status: "active",
      });

      setName("");
      setCategory("Analytics & Marketing");
      setPurpose("");
      setCategoriesInput("Browsing Behavior, Device Specs");
      setReceivedInput("IP Address, Cookie Token");
      setDpaUploaded(true);
      setDpaUrl("");
      setDpaExpiry("2027-12-31");
      setCountry("United States");
      setSccRequired(true);
      setSecurityRating("A");
      setShowAddForm(false);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Information Header */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/20 p-5 flex items-start gap-4 shadow-sm">
        <Building2 className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">
            Enterprise Vendor Risk & DPA Governance
          </h4>
          <p className="text-xs text-indigo-800 leading-relaxed max-w-4xl">
            Track all third-party Data Processors, Data Protection Agreements (DPAs), Standard Contractual Clauses (SCCs), security ratings,
            and automated renewal alerts to guarantee DPDP compliance.
          </p>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="flex flex-col gap-4 bg-white border border-gray-200 p-4 rounded-xl shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search vendor name, category, country, or data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Audit Statuses</option>
            <option value="active">Active & Verified</option>
            <option value="under_review">Under Review</option>
            <option value="expired">Expired DPA</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 text-xs"
        >
          <Plus className="h-4 w-4" />
          Add Vendor Record
        </Button>
      </div>

      {/* Add Vendor Form */}
      {showAddForm && (
        <form onSubmit={handleAddVendor} className="rounded-2xl border border-indigo-100 bg-indigo-50/10 p-6 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="text-sm font-bold text-indigo-900 border-b pb-2">New Data Processor / Vendor Record</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="vendor-name">Vendor Legal Name</Label>
              <Input id="vendor-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Google Analytics, Razorpay" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="vendor-category">Category</Label>
              <Input id="vendor-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Analytics & Marketing" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="vendor-country">Country of Incorporation</Label>
              <Input id="vendor-country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="vendor-cats">Data Categories Processed</Label>
              <Input id="vendor-cats" value={categoriesInput} onChange={(e) => setCategoriesInput(e.target.value)} placeholder="Browsing Activity, Technical Data" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="vendor-received">Specific Data Received</Label>
              <Input id="vendor-received" value={receivedInput} onChange={(e) => setReceivedInput(e.target.value)} placeholder="IP Address, User Agent, Email" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="vendor-expiry">DPA Expiration Date</Label>
              <Input id="vendor-expiry" type="date" value={dpaExpiry} onChange={(e) => setDpaExpiry(e.target.value)} className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="vendor-dpa-url">DPA Document URL (Optional)</Label>
              <Input id="vendor-dpa-url" type="url" value={dpaUrl} onChange={(e) => setDpaUrl(e.target.value)} placeholder="https://docs.example.com/dpa.pdf" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="vendor-rating">Vendor Security Rating</Label>
              <select
                id="vendor-rating"
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm"
                value={securityRating}
                onChange={(e) => setSecurityRating(e.target.value as "A+" | "A" | "B" | "C" | "F")}
              >
                <option value="A+">A+ (SOC2 Type II & ISO 27001 Certified)</option>
                <option value="A">A (Verified Compliance Standard)</option>
                <option value="B">B (Standard Security Profile)</option>
                <option value="C">C (Under Review / Needs Mitigation)</option>
                <option value="F">F (Non-Compliant)</option>
              </select>
            </div>
            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input type="checkbox" checked={dpaUploaded} onChange={(e) => setDpaUploaded(e.target.checked)} className="h-4 w-4 rounded text-indigo-600" />
                DPA Executed
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input type="checkbox" checked={sccRequired} onChange={(e) => setSccRequired(e.target.checked)} className="h-4 w-4 rounded text-indigo-600" />
                SCC Required
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="vendor-purpose">Processing Purpose & Scope</Label>
            <textarea
              id="vendor-purpose"
              rows={2}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Process website analytics, user event telemetry, and conversion tracking..."
              required
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Vendor</Button>
          </div>
        </form>
      )}

      {/* Vendors Table */}
      {filteredVendors.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-gray-500 bg-white">
          <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">No vendor registry records found.</p>
          <p className="text-xs text-gray-400 mt-1">Run a scanner audit or click "Add Vendor Record" above.</p>
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
                  new Date(vendor.dpa_expiry).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;

                return (
                  <tr
                    key={vendor.id}
                    className={
                      vendor.unconfirmed
                        ? "bg-amber-50/20 hover:bg-amber-50/30 transition-colors border-l-2 border-l-amber-500"
                        : "hover:bg-slate-50/50 transition-colors"
                    }
                  >
                    <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span>{vendor.name}</span>
                        {vendor.scanner_discovered && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold text-amber-800 uppercase tracking-wider shrink-0 flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5" /> Scanner
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-medium text-gray-500">{vendor.category || "Analytics"}</div>
                      <p className="text-[10px] font-normal text-gray-500 max-w-xs truncate">{vendor.purpose}</p>
                    </td>

                    <td className="px-6 py-4 max-w-xs space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {(vendor.data_received?.length ? vendor.data_received : vendor.data_categories).map((d, idx) => (
                          <span key={idx} className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-medium text-indigo-700">
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap space-y-1">
                      <div className="flex items-center gap-1.5">
                        {vendor.dpa_uploaded ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-green-700 text-[11px]">
                            <FileCheck className="h-3.5 w-3.5 text-green-600" /> DPA Executed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-700 text-[11px]">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> DPA Pending
                          </span>
                        )}

                        {vendor.dpa_url && (
                          <a href={vendor.dpa_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      {vendor.dpa_expiry && (
                        <div className={`text-[10px] font-semibold ${isExpiringSoon ? "text-red-600 animate-pulse" : "text-gray-500"}`}>
                          Expires: {new Date(vendor.dpa_expiry).toLocaleDateString()}
                          {isExpiringSoon && " ⚠️ (Renewal Required)"}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-gray-800">
                        <Globe2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        {vendor.country || "United States"}
                      </div>
                      {vendor.scc_required && (
                        <span className="inline-block rounded bg-blue-50 px-1.5 py-0.5 text-[8px] font-bold text-blue-700 uppercase">
                          SCC Clauses Enforced
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                            vendor.security_rating === "A+" || vendor.security_rating === "A"
                              ? "bg-green-100 text-green-800"
                              : vendor.security_rating === "B"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          Rating: {vendor.security_rating || "A"}
                        </span>
                      </div>
                      <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-600 uppercase">
                        {vendor.status || "active"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-1.5">
                      {vendor.unconfirmed && (
                        <Button
                          onClick={() => handleConfirmVendor(vendor.id)}
                          size="sm"
                          className="h-7 text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm"
                          disabled={isPending}
                        >
                          Confirm
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDelete(vendor.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 inline-flex items-center justify-center h-7 w-7"
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
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
