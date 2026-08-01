"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Shield,
  Link as LinkIcon,
  FileSpreadsheet,
  Search,
  Lock,
  Globe,
  User,
  Sparkles,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createInventoryItemAction,
  updateInventoryItemAction,
  deleteInventoryItemAction,
} from "./actions";

interface InventoryItem {
  id: string;
  category: string;
  processing_activity?: string;
  data_subject: string;
  purpose: string;
  data_types: string[];
  shared_with_processor: string | null;
  legal_basis: string;
  retention_period: string;
  storage_location?: string;
  cross_border_transfer?: boolean;
  transfer_countries?: string[];
  encryption_status?: string;
  owner_email?: string | null;
  status?: "active" | "archived" | "review_required";
  ai_classification_confidence?: number | null;
  unconfirmed: boolean;
}

export function InventoryClient({ initialItems }: { initialItems: InventoryItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  // Form states
  const [category, setCategory] = useState("");
  const [activity, setActivity] = useState("Web Browsing & User Telemetry");
  const [subject, setSubject] = useState("Website Visitors");
  const [purpose, setPurpose] = useState("");
  const [dataTypesInput, setDataTypesInput] = useState("IP Address, Unique ID, Browser Footprint");
  const [processor, setProcessor] = useState("");
  const [basis, setBasis] = useState("Consent (Section 6)");
  const [retention, setRetention] = useState("Until consent withdrawn");
  const [storage, setStorage] = useState("AWS ap-south-1 (Mumbai)");
  const [crossBorder, setCrossBorder] = useState(false);
  const [transferCountriesInput, setTransferCountriesInput] = useState("");
  const [encryption, setEncryption] = useState("AES-256 at rest, TLS 1.3 in transit");
  const [ownerEmail, setOwnerEmail] = useState("");

  const filteredItems = initialItems.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.category.toLowerCase().includes(q) ||
      item.purpose.toLowerCase().includes(q) ||
      item.data_subject.toLowerCase().includes(q) ||
      (item.processing_activity && item.processing_activity.toLowerCase().includes(q)) ||
      (item.shared_with_processor && item.shared_with_processor.toLowerCase().includes(q)) ||
      item.data_types.some((t) => t.toLowerCase().includes(q));

    const matchesSubject =
      subjectFilter === "all" || item.data_subject.toLowerCase() === subjectFilter.toLowerCase();

    return matchesSearch && matchesSubject;
  });

  const handleConfirmItem = (itemId: string) => {
    startTransition(async () => {
      await updateInventoryItemAction(itemId, {
        unconfirmed: false,
        status: "active",
      });
      router.refresh();
    });
  };

  const handleDelete = (itemId: string) => {
    if (!confirm("Are you sure you want to delete this data inventory record?")) return;
    startTransition(async () => {
      await deleteInventoryItemAction(itemId);
      router.refresh();
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !purpose) return;

    startTransition(async () => {
      const types = dataTypesInput.split(",").map((t) => t.trim()).filter(Boolean);
      const countries = transferCountriesInput.split(",").map((c) => c.trim()).filter(Boolean);

      await createInventoryItemAction({
        category,
        processing_activity: activity,
        data_subject: subject,
        purpose,
        data_types: types,
        shared_with_processor: processor || undefined,
        legal_basis: basis,
        retention_period: retention,
        storage_location: storage,
        cross_border_transfer: crossBorder,
        transfer_countries: countries,
        encryption_status: encryption,
        owner_email: ownerEmail || undefined,
        status: "active",
        ai_classification_confidence: 0.98,
      });

      setCategory("");
      setActivity("Web Browsing & User Telemetry");
      setSubject("Website Visitors");
      setPurpose("");
      setDataTypesInput("IP Address, Unique ID");
      setProcessor("");
      setBasis("Consent (Section 6)");
      setRetention("Until consent withdrawn");
      setStorage("AWS ap-south-1 (Mumbai)");
      setCrossBorder(false);
      setTransferCountriesInput("");
      setEncryption("AES-256 at rest, TLS 1.3 in transit");
      setOwnerEmail("");
      setShowAddForm(false);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Information Box */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/20 p-5 flex items-start gap-4 shadow-sm">
        <Shield className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">
            DPDP Section 8 Compliant Data Inventory
          </h4>
          <p className="text-xs text-indigo-800 leading-relaxed max-w-4xl">
            Maintain an ongoing, audit-ready inventory of all personal data categories, processing activities, retention windows,
            storage regions, cross-border transfers, and encryption standards. Scanner auto-discovery automatically populates new data flows.
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
              placeholder="Search activity, category, storage, vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Data Subjects</option>
            <option value="Website Visitors">Website Visitors</option>
            <option value="Registered Customers">Registered Customers</option>
            <option value="Employee Records">Employee Records</option>
            <option value="Minors / Children">Minors / Children</option>
          </select>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 text-xs"
        >
          <Plus className="h-4 w-4" />
          Add Inventory Record
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddItem} className="rounded-2xl border border-indigo-100 bg-indigo-50/10 p-6 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="text-sm font-bold text-indigo-900 border-b pb-2">New Data Inventory Record</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="item-category">Data Category</Label>
              <Input id="item-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Identity & Contact Info" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="item-activity">Processing Activity</Label>
              <Input id="item-activity" value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="e.g. User Authentication & Billing" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="item-subject">Data Subject</Label>
              <select
                id="item-subject"
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-1"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option>Website Visitors</option>
                <option>Registered Customers</option>
                <option>Employee Records</option>
                <option>Minors / Children</option>
              </select>
            </div>
            <div>
              <Label htmlFor="item-processor">Third-Party Processor (Vendor)</Label>
              <Input id="item-processor" value={processor} onChange={(e) => setProcessor(e.target.value)} placeholder="e.g. Razorpay, Google Cloud, or Internal" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="item-types">Data Fields / Types (comma-separated)</Label>
              <Input id="item-types" value={dataTypesInput} onChange={(e) => setDataTypesInput(e.target.value)} placeholder="Email, Phone, IP Address" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="item-basis">Legal Basis</Label>
              <Input id="item-basis" value={basis} onChange={(e) => setBasis(e.target.value)} placeholder="Consent (Section 6), Legitimate Use" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="item-retention">Retention Period</Label>
              <Input id="item-retention" value={retention} onChange={(e) => setRetention(e.target.value)} placeholder="Until consent withdrawn, 7 Years" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="item-storage">Storage Location / Region</Label>
              <Input id="item-storage" value={storage} onChange={(e) => setStorage(e.target.value)} placeholder="AWS ap-south-1 (Mumbai)" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="item-encryption">Encryption Standard</Label>
              <Input id="item-encryption" value={encryption} onChange={(e) => setEncryption(e.target.value)} placeholder="AES-256 at rest, TLS 1.3 in transit" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="item-owner">Data Steward / Owner Email</Label>
              <Input id="item-owner" type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="privacy@company.com" className="mt-1" />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={crossBorder}
                  onChange={(e) => setCrossBorder(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Includes Cross-Border Transfer
              </label>

              {crossBorder && (
                <Input
                  value={transferCountriesInput}
                  onChange={(e) => setTransferCountriesInput(e.target.value)}
                  placeholder="Transfer Countries (e.g. US, SG)"
                  className="text-xs h-8 w-60"
                />
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Record</Button>
            </div>
          </div>
          <div>
            <Label htmlFor="item-purpose">Detailed Processing Purpose</Label>
            <textarea
              id="item-purpose"
              rows={2}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-1"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Enable user login, send transaction alerts, and fulfill statutory tax reporting..."
              required
            />
          </div>
        </form>
      )}

      {/* Inventory Table */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-gray-500 bg-white">
          <FileSpreadsheet className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">
            {initialItems.length === 0 ? "No data inventory records found." : "No inventory items match your search filters."}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {initialItems.length === 0
              ? "Run a scan on your website to auto-populate detected data flows."
              : "Try adjusting your search query or subject filter."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">
              <tr>
                <th className="px-6 py-4">Data Category & Activity</th>
                <th className="px-6 py-4">Subject & Purpose</th>
                <th className="px-6 py-4">Storage & Encryption</th>
                <th className="px-6 py-4">Processor & Transfers</th>
                <th className="px-6 py-4">Legal Basis & Retention</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className={
                    item.unconfirmed
                      ? "bg-amber-50/20 hover:bg-amber-50/30 transition-colors border-l-2 border-l-amber-500"
                      : "hover:bg-slate-50/50 transition-colors"
                  }
                >
                  <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span>{item.category}</span>
                      {item.unconfirmed && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold text-amber-800 uppercase tracking-wider shrink-0">
                          Auto-Discovered
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-indigo-500 shrink-0" />
                      {item.processing_activity || "Web Activity"}
                    </div>
                    {item.ai_classification_confidence && (
                      <span className="inline-block rounded bg-indigo-50 px-1.5 py-0.5 text-[8px] font-semibold text-indigo-700">
                        AI Score: {Math.round(item.ai_classification_confidence * 100)}%
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 max-w-xs space-y-1">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-800">
                      {item.data_subject}
                    </span>
                    <p className="font-semibold text-gray-800 text-[11px] leading-snug">{item.purpose}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.data_types.map((t, idx) => (
                        <span key={idx} className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-medium text-indigo-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap space-y-1">
                    <div className="flex items-center gap-1 text-[11px] text-gray-700 font-medium">
                      <Server className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      {item.storage_location || "AWS ap-south-1"}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                      <Lock className="h-3 w-3 text-emerald-600 shrink-0" />
                      {item.encryption_status || "AES-256 / TLS 1.3"}
                    </div>
                    {item.owner_email && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <User className="h-3 w-3 text-gray-400 shrink-0" />
                        {item.owner_email}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap space-y-1">
                    {item.shared_with_processor ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-gray-800 text-[11px]">
                        <LinkIcon className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        {item.shared_with_processor}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic text-[11px]">Internal Only</span>
                    )}

                    {item.cross_border_transfer && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700">
                        <Globe className="h-3 w-3 text-amber-600 shrink-0" />
                        Cross-Border ({item.transfer_countries?.join(", ") || "US/EU"})
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap space-y-1 text-[11px]">
                    <div>
                      <span className="font-bold text-gray-400">Basis: </span>
                      <span className="font-medium text-gray-800">{item.legal_basis}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-400">Retain: </span>
                      <span className="font-medium text-gray-800">{item.retention_period}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right whitespace-nowrap space-x-1.5">
                    {item.unconfirmed && (
                      <Button
                        onClick={() => handleConfirmItem(item.id)}
                        size="sm"
                        className="h-7 text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm"
                        disabled={isPending}
                      >
                        Confirm
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 inline-flex items-center justify-center h-7 w-7"
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
