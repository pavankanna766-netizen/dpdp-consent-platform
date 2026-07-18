"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Clock, Mail, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBreachIncidentAction, markNotifiedAction } from "./actions";

interface BreachIncident {
  id: string;
  breach_type: string;
  affected_users: number;
  data_categories: string;
  description: string | null;
  certin_deadline: string;
  dpbi_deadline: string;
  certin_notified_at: string | null;
  dpbi_notified_at: string | null;
  created_at: string;
}

export function BreachIncidentClient({
  initialIncidents,
}: {
  initialIncidents: BreachIncident[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showLogForm, setShowLogForm] = useState(false);

  // Form states
  const [breachType, setBreachType] = useState("Unauthorized API access");
  const [affectedUsers, setAffectedUsers] = useState(1500);
  const [dataCategories, setDataCategories] = useState("Customer profile details, Email hashes");
  const [description, setDescription] = useState("");
  const [detectedAt, setDetectedAt] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - 30); // Default to 30 mins ago
    return d.toISOString().slice(0, 16);
  });

  // Simple countdown tick
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!breachType || !dataCategories) return;

    startTransition(async () => {
      await createBreachIncidentAction({
        breach_type: breachType,
        affected_users: affectedUsers,
        data_categories: dataCategories,
        description: description,
        detected_at: new Date(detectedAt).toISOString(),
      });
      setShowLogForm(false);
      router.refresh();
    });
  };

  const handleMarkNotified = (id: string, target: "certin" | "dpbi") => {
    if (!confirm(`Mark this incident as officially reported to ${target.toUpperCase()}?`)) return;
    startTransition(async () => {
      await markNotifiedAction(id, target);
      router.refresh();
    });
  };

  // Helper to format countdown timer or elapsed status
  const getTimerDetails = (deadlineStr: string, notifiedAtStr: string | null) => {
    const deadline = new Date(deadlineStr).getTime();
    const now = Date.now();

    if (notifiedAtStr) {
      const notifiedTime = new Date(notifiedAtStr).getTime();
      const inTime = notifiedTime <= deadline;
      return {
        label: `Reported in ${inTime ? "time" : "late"}`,
        status: inTime ? "compliant" : "missed",
        timeStr: new Date(notifiedAtStr).toLocaleString(),
      };
    }

    const diff = deadline - now;
    if (diff <= 0) {
      return {
        label: "Deadline Missed",
        status: "missed",
        timeStr: "00h 00m 00s",
      };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      label: "Time Remaining",
      status: diff < 2 * 60 * 60 * 1000 ? "critical" : "active",
      timeStr: `${hours.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`,
    };
  };

  // Email draft templates helper
  const [activeDraft, setActiveDraft] = useState<{
    subject: string;
    body: string;
  } | null>(null);

  const showEmailDraft = (incident: BreachIncident, target: "certin" | "dpbi") => {
    if (target === "certin") {
      setActiveDraft({
        subject: `[INCIDENT-REPORT] Cybersecurity Breach Notification - CERT-In`,
        body: `To: incident@cert-in.org.in
Cc: compliance@privystack.in

Dear Incident Response Team,

Pursuant to Section 70B of the Information Technology Act and the directions issued thereunder, we hereby report a cybersecurity incident:

1. Submitting Entity: PrivyStack Client Org
2. Time of Detection: ${new Date(incident.created_at).toLocaleString()}
3. Nature of Incident: ${incident.breach_type}
4. Description: ${incident.description || "Suspected data breach."}
5. Estimated Affected Users: ${incident.affected_users}
6. Contact Details: compliance@privystack.in

Please confirm receipt.

Sincerely,
Compliance Officer`,
      });
    } else {
      setActiveDraft({
        subject: `[DPDP-BREACH] Data Principal Incident Disclosure - DPBI`,
        body: `To: incident-disclosure@dpbi.gov.in
Cc: compliance@privystack.in

Dear Board Members,

Pursuant to Section 8(6) of the Digital Personal Data Protection (DPDP) Act, 2023, we hereby notify the Board of a personal data breach:

1. Data Fiduciary Name: PrivyStack Client Org
2. Incident Category: ${incident.breach_type}
3. Categories of Personal Data Breached: ${incident.data_categories}
4. Estimated Data Principals Affected: ${incident.affected_users}
5. Remedial Steps Initiated: Access keys rotated, session tokens revoked.

We remain available to provide additional updates as they become available.

Sincerely,
Compliance Team`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top CTA actions bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-red-500 shrink-0" />
          <div>
            <h2 className="text-sm font-bold text-gray-900">Suspected Data Leaks & Auditing</h2>
            <p className="text-xs text-gray-500">Log security incidents immediately to start regulatory timers.</p>
          </div>
        </div>
        <Button onClick={() => setShowLogForm(!showLogForm)} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
          {showLogForm ? "Close Form" : "Log Suspected Breach"}
        </Button>
      </div>

      {/* Log breach incident form */}
      {showLogForm && (
        <form onSubmit={handleLogIncident} className="rounded-xl border border-red-100 bg-red-50/10 p-6 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="text-sm font-bold text-red-900 border-b pb-2">Log New Security Breach</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="breach-type">Nature of Breach</Label>
              <Input id="breach-type" value={breachType} onChange={(e) => setBreachType(e.target.value)} placeholder="e.g., Unauthorized API leakage, phishing..." className="mt-1" />
            </div>
            <div>
              <Label htmlFor="affected-users">Estimated Affected Data Principals</Label>
              <Input id="affected-users" type="number" value={affectedUsers} onChange={(e) => setAffectedUsers(Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="data-categories">Data Categories Affected</Label>
              <Input id="data-categories" value={dataCategories} onChange={(e) => setDataCategories(e.target.value)} placeholder="e.g., Phone numbers, PAN hashes..." className="mt-1" />
            </div>
            <div>
              <Label htmlFor="detected-at">Date/Time Detected</Label>
              <Input id="detected-at" type="datetime-local" value={detectedAt} onChange={(e) => setDetectedAt(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Breach Remediation Actions Initiated</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe key events, suspected root causes, and containment strategies..." className="mt-1" />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowLogForm(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={isPending} className="bg-red-600 hover:bg-red-700 text-white font-semibold">Start Countdown Clocks</Button>
          </div>
        </form>
      )}

      {/* Incidents list */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">
            <tr>
              <th className="px-6 py-4">Incident Details</th>
              <th className="px-6 py-4">Principals & categories</th>
              <th className="px-6 py-4">CERT-In Status (6-Hour Clock)</th>
              <th className="px-6 py-4">DPBI Status (72-Hour Clock)</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {initialIncidents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                  No logged breaches. (System remains compliant and secure).
                </td>
              </tr>
            ) : (
              initialIncidents.map((incident) => {
                const certDetails = getTimerDetails(incident.certin_deadline, incident.certin_notified_at);
                const dpbiDetails = getTimerDetails(incident.dpbi_deadline, incident.dpbi_notified_at);

                return (
                  <tr key={incident.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{incident.breach_type}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Detected: {new Date(incident.created_at).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{incident.affected_users.toLocaleString()} Principals</div>
                      <div className="text-gray-400 mt-0.5 max-w-[200px] truncate">{incident.data_categories}</div>
                    </td>

                    {/* CERT-In Column */}
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        {certDetails.status === "compliant" && <CheckCircle className="h-3.5 w-3.5 text-green-600" />}
                        {certDetails.status === "missed" && <AlertTriangle className="h-3.5 w-3.5 text-red-600 animate-pulse" />}
                        {certDetails.status === "critical" && <Clock className="h-3.5 w-3.5 text-amber-500 animate-spin" />}
                        {certDetails.status === "active" && <Clock className="h-3.5 w-3.5 text-blue-500" />}
                        <span className={
                          certDetails.status === "compliant" ? "text-green-700" :
                          certDetails.status === "missed" ? "text-red-700" :
                          certDetails.status === "critical" ? "text-amber-700" : "text-blue-700"
                        }>
                          {certDetails.timeStr}
                        </span>
                      </div>
                      <div className="text-[9px] text-gray-400">{certDetails.label}</div>
                    </td>

                    {/* DPBI Column */}
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        {dpbiDetails.status === "compliant" && <CheckCircle className="h-3.5 w-3.5 text-green-600" />}
                        {dpbiDetails.status === "missed" && <AlertTriangle className="h-3.5 w-3.5 text-red-600 animate-pulse" />}
                        {dpbiDetails.status === "critical" && <Clock className="h-3.5 w-3.5 text-amber-500 animate-spin" />}
                        {dpbiDetails.status === "active" && <Clock className="h-3.5 w-3.5 text-blue-500" />}
                        <span className={
                          dpbiDetails.status === "compliant" ? "text-green-700" :
                          dpbiDetails.status === "missed" ? "text-red-700" :
                          dpbiDetails.status === "critical" ? "text-amber-700" : "text-blue-700"
                        }>
                          {dpbiDetails.timeStr}
                        </span>
                      </div>
                      <div className="text-[9px] text-gray-400">{dpbiDetails.label}</div>
                    </td>

                    <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                      {!incident.certin_notified_at && (
                        <Button size="sm" onClick={() => handleMarkNotified(incident.id, "certin")} className="h-7 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                          Report CERT-In
                        </Button>
                      )}
                      {!incident.dpbi_notified_at && (
                        <Button size="sm" onClick={() => handleMarkNotified(incident.id, "dpbi")} className="h-7 text-[10px] bg-red-600 hover:bg-red-700 text-white font-semibold">
                          Report DPBI
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => showEmailDraft(incident, "certin")} className="h-7 text-[10px] inline-flex items-center gap-1 text-gray-700">
                        <Mail className="h-3 w-3" /> Drafts
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Email Drafts overlay modal */}
      {activeDraft && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border p-6 max-w-2xl w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">{activeDraft.subject}</h3>
              <Button size="sm" variant="ghost" onClick={() => setActiveDraft(null)} className="h-7 w-7 text-xs p-0 text-gray-400 hover:text-gray-500">✕</Button>
            </div>
            <pre className="bg-slate-50 border p-4 rounded-lg font-mono text-[10px] text-gray-700 overflow-auto max-h-[300px] whitespace-pre-wrap">
              {activeDraft.body}
            </pre>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setActiveDraft(null)}>Close Draft</Button>
              <Button size="sm" onClick={() => {
                navigator.clipboard.writeText(activeDraft.body);
                alert("Email notification text copied to clipboard!");
              }} className="bg-indigo-600 hover:bg-indigo-700 text-white">Copy Content</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
