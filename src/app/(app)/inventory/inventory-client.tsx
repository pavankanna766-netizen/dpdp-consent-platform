"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Shield, Info, Link, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInventoryItemAction, deleteInventoryItemAction } from "./actions";

interface InventoryItem {
  id: string;
  category: string;
  data_subject: string;
  purpose: string;
  data_types: string[];
  shared_with_processor: string | null;
  legal_basis: string;
  retention_period: string;
}

export function InventoryClient({ initialItems }: { initialItems: InventoryItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("Website Visitors");
  const [purpose, setPurpose] = useState("");
  const [dataTypesInput, setDataTypesInput] = useState("IP Address, Unique ID");
  const [processor, setProcessor] = useState("");
  const [basis, setBasis] = useState("Consent (Section 6)");
  const [retention, setRetention] = useState("Until withdrawn");

  const handleDelete = (itemId: string) => {
    if (!confirm("Are you sure you want to delete this inventory item?")) return;
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
      await createInventoryItemAction({
        category,
        data_subject: subject,
        purpose,
        data_types: types,
        shared_with_processor: processor || undefined,
        legal_basis: basis,
        retention_period: retention,
      });
      setCategory("");
      setSubject("Website Visitors");
      setPurpose("");
      setDataTypesInput("IP Address, Unique ID");
      setProcessor("");
      setBasis("Consent (Section 6)");
      setRetention("Until withdrawn");
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
          <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Data Inventory as the Spine of Truth</h4>
          <p className="text-xs text-indigo-800 leading-relaxed max-w-4xl">
            Under DPDP guidelines, privacy policies must never drift from reality. By keeping a live inventory of what you process and
            where it is shared, your consent templates, banner toggles, and privacy disclosures automatically align with your active data
            practices, eliminating legal risks of compliance drift.
          </p>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
        <h2 className="text-sm font-bold text-gray-700">Inventory Ledger ({initialItems.length} records)</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-4 w-4" />
          Add Inventory Record
        </Button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <form onSubmit={handleAddItem} className="rounded-2xl border border-indigo-100 bg-indigo-50/10 p-6 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="text-sm font-bold text-indigo-900 border-b pb-2">New Inventory Item</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="item-category">Processing Category</Label>
              <Input id="item-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Analytics Tracker, Payment Gateway" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="item-subject">Data Subject Category</Label>
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
              <Label htmlFor="item-processor">Shared Processor (Vendor)</Label>
              <Input id="item-processor" value={processor} onChange={(e) => setProcessor(e.target.value)} placeholder="e.g. Google, Razorpay, or leave empty if internal" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="item-types">Data Fields / Types (comma-separated)</Label>
              <Input id="item-types" value={dataTypesInput} onChange={(e) => setDataTypesInput(e.target.value)} placeholder="IP address, Name..." className="mt-1" />
            </div>
            <div>
              <Label htmlFor="item-basis">Legal Basis</Label>
              <Input id="item-basis" value={basis} onChange={(e) => setBasis(e.target.value)} placeholder="Consent (Section 6), Legitimate Use..." className="mt-1" />
            </div>
            <div>
              <Label htmlFor="item-retention">Retention Period</Label>
              <Input id="item-retention" value={retention} onChange={(e) => setRetention(e.target.value)} placeholder="Until withdrawn, 2 Years..." className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="item-purpose">Detailed Processing Purpose</Label>
            <textarea
              id="item-purpose"
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-1"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Map customer transaction patterns to satisfy billing and Razorpay API obligations..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Record</Button>
          </div>
        </form>
      )}

      {/* Inventory Table */}
      {initialItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-gray-500 bg-white">
          <FileSpreadsheet className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">No data inventory records found.</p>
          <p className="text-xs text-gray-400 mt-1">Run a scan on your website to auto-populate detected data flows.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">
              <tr>
                <th className="px-6 py-4">Processing Category</th>
                <th className="px-6 py-4">Data Subjects</th>
                <th className="px-6 py-4">Purpose & Data Fields</th>
                <th className="px-6 py-4">Processor (Vendor)</th>
                <th className="px-6 py-4">Legal Basis & Retention</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {initialItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-gray-800">
                      {item.data_subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-sm">
                    <p className="font-semibold text-gray-800">{item.purpose}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {item.data_types.map((t, idx) => (
                        <span key={idx} className="rounded bg-indigo-50 px-2 py-0.5 text-[9px] font-medium text-indigo-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.shared_with_processor ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-gray-800">
                        <Link className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        {item.shared_with_processor}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Internal Only</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-y-1">
                    <div>
                      <span className="font-bold text-gray-400">Basis: </span>
                      <span className="font-medium text-gray-800">{item.legal_basis}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-400">Retain: </span>
                      <span className="font-medium text-gray-800">{item.retention_period}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <Button
                      onClick={() => handleDelete(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
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
