"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldAlert, Plus, Trash2, Calendar, FileCheck2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createVendorAction, updateVendorAction, deleteVendorAction } from "./actions";

interface Vendor {
  id: string;
  name: string;
  data_categories: string[];
  purpose: string;
  agreement_clears_safeguard_bar: boolean;
  renewal_status: string;
  contract_expiry: string | null;
}

export function VendorRegistryClient({ initialVendors }: { initialVendors: Vendor[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [categoriesInput, setCategoriesInput] = useState("Usage Metrics, Device IDs");
  const [clearsBar, setClearsBar] = useState(false);
  const [expiry, setExpiry] = useState("");

  const handleToggleAudit = (vendorId: string, currentStatus: boolean) => {
    startTransition(async () => {
      await updateVendorAction(vendorId, {
        agreement_clears_safeguard_bar: !currentStatus,
      });
      router.refresh();
    });
  };

  const handleDelete = (vendorId: string) => {
    if (!confirm("Are you sure you want to remove this vendor from the registry?")) return;
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
      await createVendorAction({
        name,
        purpose,
        data_categories: cats,
        agreement_clears_safeguard_bar: clearsBar,
        renewal_status: "Active",
        contract_expiry: expiry || undefined,
      });
      setName("");
      setPurpose("");
      setCategoriesInput("Usage Metrics, Device IDs");
      setClearsBar(false);
      setExpiry("");
      setShowAddForm(false);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Warning Box */}
      <div className="rounded-2xl border border-red-100 bg-red-50/40 p-5 flex items-start gap-4 shadow-sm">
        <ShieldAlert className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-red-900 uppercase tracking-wide">Fiduciary Non-Delegable Liability</h4>
          <p className="text-xs text-red-700 leading-relaxed max-w-4xl">
            Under the notified DPDP Rules, engaging a data processor (vendor) without a specialized DPDP-compliant data processing
            addendum (DPA) that explicitly sets out technical safeguards is a direct compliance violation. You are subject to the same
            regulatory penalties (up to ₹250 crore) for any leak caused by a vendor.
          </p>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
        <h2 className="text-sm font-bold text-gray-700">Registered Processors ({initialVendors.length})</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-4 w-4" />
          Register Custom Vendor
        </Button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <form onSubmit={handleAddVendor} className="rounded-2xl border border-indigo-100 bg-indigo-50/10 p-6 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="text-sm font-bold text-indigo-900 border-b pb-2">Register Vendor</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="vendor-name">Vendor Name</Label>
              <Input id="vendor-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Google Analytics, Razorpay..." className="mt-1" />
            </div>
            <div>
              <Label htmlFor="vendor-categories">Data Categories Shared (comma-separated)</Label>
              <Input id="vendor-categories" value={categoriesInput} onChange={(e) => setCategoriesInput(e.target.value)} placeholder="IP address, Phone number..." className="mt-1" />
            </div>
            <div>
              <Label htmlFor="vendor-purpose">Processing Purpose</Label>
              <Input id="vendor-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Analyze web traffic..." className="mt-1" />
            </div>
            <div>
              <Label htmlFor="vendor-expiry">Agreement Expiry</Label>
              <Input id="vendor-expiry" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={clearsBar}
                onChange={(e) => setClearsBar(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-gray-700">This contract clears DPDP security safeguards</span>
            </label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Vendor</Button>
            </div>
          </div>
        </form>
      )}

      {/* Grid of vendors */}
      {initialVendors.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-gray-500">
          <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">No registered vendors yet.</p>
          <p className="text-xs text-gray-400 mt-1">Run a scan on your website to auto-populate detected tracking processors.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {initialVendors.map((vendor) => (
            <div key={vendor.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-150 transition-all">
              <div>
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-gray-900">{vendor.name}</h3>
                  <button
                    onClick={() => handleToggleAudit(vendor.id, vendor.agreement_clears_safeguard_bar)}
                    disabled={isPending}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                      vendor.agreement_clears_safeguard_bar
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {vendor.agreement_clears_safeguard_bar ? (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" /> DPA Safeguard Cleared
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-3.5 w-3.5 animate-pulse" /> Pending Review
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-3 pt-3">
                  <div className="text-xs">
                    <span className="font-semibold text-gray-500">Purpose: </span>
                    <span className="text-gray-700">{vendor.purpose}</span>
                  </div>

                  <div className="text-xs">
                    <span className="font-semibold text-gray-500">Shared Data: </span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {vendor.data_categories.map((c, i) => (
                        <span key={i} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-4 text-xs">
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Expiry:{" "}
                    {vendor.contract_expiry
                      ? new Date(vendor.contract_expiry).toLocaleDateString()
                      : "Indefinite / Not Logged"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleToggleAudit(vendor.id, vendor.agreement_clears_safeguard_bar)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-[11px] h-8"
                    disabled={isPending}
                  >
                    <FileCheck2 className="h-3.5 w-3.5" /> Toggle Audit
                  </Button>
                  <Button
                    onClick={() => handleDelete(vendor.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 h-8 w-8 shrink-0"
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
