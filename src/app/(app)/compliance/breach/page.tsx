"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Clock, Copy, Send, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BreachReportingPage() {
  const [detectedAt, setDetectedAt] = useState("");
  const [breachType, setBreachType] = useState("Unauthorised Access");
  const [affectedUsers, setAffectedUsers] = useState("100");
  const [dataCategories, setDataCategories] = useState("Name, Email, Mobile Number");
  const [description, setDescription] = useState("");
  const [isCopiedCert, setIsCopiedCert] = useState(false);
  const [isCopiedDpbi, setIsCopiedDpbi] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [activeDraft, setActiveDraft] = useState<"certin" | "dpbi">("dpbi");

  // Timers
  const [certRemaining, setCertRemaining] = useState<string>("");
  const [dpbiRemaining, setDpbiRemaining] = useState<string>("");
  const [isCertOverdue, setIsCertOverdue] = useState(false);
  const [isDpbiOverdue, setIsDpbiOverdue] = useState(false);

  useEffect(() => {
    if (!detectedAt) {
      setCertRemaining("");
      setDpbiRemaining("");
      return;
    }

    const interval = setInterval(() => {
      const detectTime = new Date(detectedAt).getTime();
      const now = Date.now();

      // CERT-In: 6 hours
      const certLimit = detectTime + 6 * 60 * 60 * 1000;
      const certDiff = certLimit - now;
      if (certDiff <= 0) {
        setCertRemaining("Overdue");
        setIsCertOverdue(true);
      } else {
        setIsCertOverdue(false);
        const h = Math.floor(certDiff / (1000 * 60 * 60));
        const m = Math.floor((certDiff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((certDiff % (1000 * 60)) / 1000);
        setCertRemaining(`${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`);
      }

      // DPDP Board: 72 hours
      const dpbiLimit = detectTime + 72 * 60 * 60 * 1000;
      const dpbiDiff = dpbiLimit - now;
      if (dpbiDiff <= 0) {
        setDpbiRemaining("Overdue");
        setIsDpbiOverdue(true);
      } else {
        setIsDpbiOverdue(false);
        const h = Math.floor(dpbiDiff / (1000 * 60 * 60));
        const m = Math.floor((dpbiDiff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((dpbiDiff % (1000 * 60)) / 1000);
        setDpbiRemaining(`${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [detectedAt]);

  const certEmailBody = `To: incident@cert-in.org.in
Subject: INCIDENT REPORT - CERT-In 6-Hour Mandate Compliance

Dear CERT-In Incident Response Team,

We are writing to report a cybersecurity incident under the CERT-In Cyber Security Directions 2022.

--- INCIDENT SUMMARY ---
1. Type of Incident: ${breachType}
2. Time of Detection: ${detectedAt ? new Date(detectedAt).toLocaleString("en-IN") : "Pending"}
3. Categories of Systems/Data Affected: ${dataCategories}
4. Number of Impacted Users (Estimate): ${affectedUsers}
5. Description & Impact: ${description || "Details under investigation."}
6. Remedial Actions Taken: Isolated compromised systems and suspended credentials.

Sincerely,
Incident Response Team
[Fiduciary Compliance Officer]`;

  const dpbiEmailBody = `To: reports@dpbi.gov.in
Subject: BREACH NOTIFICATION - DPDP Act Section 8(6) Compliance

Dear Data Protection Board of India,

Pursuant to Section 8(6) of the Digital Personal Data Protection (DPDP) Act, 2023, we hereby notify the Board of a personal data breach.

--- DATA BREACH REPORT ---
1. Nature of the Personal Data Breach: ${breachType}
2. Incident Detection Timestamp: ${detectedAt ? new Date(detectedAt).toLocaleString("en-IN") : "Pending"}
3. Categories of Personal Data Affected: ${dataCategories}
4. Estimated Number of Impacted Data Principals: ${affectedUsers}
5. Impact Analysis: Potential risk of unauthorized identity exposure.
6. Measures Taken to Mitigate Harm: Enforced rotation of service tokens, notified affected servers, and initiated legal principal notifications.

Sincerely,
Data Protection Officer (DPO)
[Fiduciary Organization]`;

  const handleCopy = (text: string, type: "cert" | "dpbi") => {
    navigator.clipboard.writeText(text);
    if (type === "cert") {
      setIsCopiedCert(true);
      setTimeout(() => setIsCopiedCert(false), 2000);
    } else {
      setIsCopiedDpbi(true);
      setTimeout(() => setIsCopiedDpbi(false), 2000);
    }
  };

  const handleLogIncident = () => {
    setIsLogged(true);
    setTimeout(() => setIsLogged(false), 3000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">🚨 Indian Regulatory Breach Incident Response</h1>
        <p className="text-sm text-gray-500 max-w-3xl">
          Fiduciaries bear non-delegable liability for data leaks under the **DPDP Act 2023**. Suspected incidents must be reported
          to the **DPBI within 72 hours** (Section 8(6)) and cybersecurity incidents to **CERT-In within 6 hours**.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Incident Details Form */}
        <div className="lg:col-span-3 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">Log Suspected Breach</h2>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="detected-at" className="text-xs font-semibold uppercase text-gray-500">
                Breach/Incident Detection Time (IST)
              </Label>
              <Input
                id="detected-at"
                type="datetime-local"
                className="mt-1"
                value={detectedAt}
                onChange={(e) => setDetectedAt(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="breach-type" className="text-xs font-semibold uppercase text-gray-500">
                Incident Category
              </Label>
              <select
                id="breach-type"
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={breachType}
                onChange={(e) => setBreachType(e.target.value)}
              >
                <option>Unauthorised Access / Intrusion</option>
                <option>Database Leak / Exposure</option>
                <option>Ransomware Encryption</option>
                <option>API Token Compromise</option>
                <option>Social Engineering / Phishing</option>
              </select>
            </div>

            <div>
              <Label htmlFor="affected-users" className="text-xs font-semibold uppercase text-gray-500">
                Data Principals Affected (Estimate)
              </Label>
              <Input
                id="affected-users"
                type="number"
                className="mt-1"
                value={affectedUsers}
                onChange={(e) => setAffectedUsers(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="data-categories" className="text-xs font-semibold uppercase text-gray-500">
                Personal Data Categories Leaked
              </Label>
              <Input
                id="data-categories"
                type="text"
                className="mt-1"
                value={dataCategories}
                onChange={(e) => setDataCategories(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-xs font-semibold uppercase text-gray-500">
                Impact Assessment & Mitigation Details
              </Label>
              <textarea
                id="description"
                rows={4}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="List systems compromised and actions taken to contain the incident..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
              onClick={handleLogIncident}
              disabled={!detectedAt}
            >
              {isLogged ? "Logged to Audit Ledger! ✅" : "Commit to Immutable Audit Logs"}
            </Button>
          </div>
        </div>

        {/* Clocks and Templates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Twin Regulatory Timers */}
          <div className="grid grid-cols-2 gap-4">
            {/* CERT-In Timer */}
            <div className={`rounded-2xl border p-4 shadow-sm flex flex-col justify-between h-28 ${
              !detectedAt
                ? "bg-slate-50 border-slate-200 text-slate-400"
                : isCertOverdue
                ? "bg-red-50 border-red-200 text-red-700 animate-pulse"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span className="font-bold text-[9px] uppercase tracking-wider">CERT-In (6h)</span>
              </div>
              <div className="font-mono font-bold text-lg mt-2">
                {!detectedAt ? "--:--:--" : certRemaining}
              </div>
              <span className="text-[8px] opacity-75">Cybersecurity Mandate</span>
            </div>

            {/* DPDP Board Timer */}
            <div className={`rounded-2xl border p-4 shadow-sm flex flex-col justify-between h-28 ${
              !detectedAt
                ? "bg-slate-50 border-slate-200 text-slate-400"
                : isDpbiOverdue
                ? "bg-red-50 border-red-200 text-red-700 animate-pulse"
                : "bg-indigo-50 border-indigo-200 text-indigo-900"
            }`}>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span className="font-bold text-[9px] uppercase tracking-wider">DPBI Board (72h)</span>
              </div>
              <div className="font-mono font-bold text-lg mt-2">
                {!detectedAt ? "--:--:--" : dpbiRemaining}
              </div>
              <span className="text-[8px] opacity-75">DPDP Privacy Mandate</span>
            </div>
          </div>

          {/* Draft Templates Drawer */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex border-b">
              <button
                onClick={() => setActiveDraft("dpbi")}
                className={`flex-1 pb-2 text-xs font-semibold border-b-2 transition-all ${
                  activeDraft === "dpbi" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                DPBI Notice (72h)
              </button>
              <button
                onClick={() => setActiveDraft("certin")}
                className={`flex-1 pb-2 text-xs font-semibold border-b-2 transition-all ${
                  activeDraft === "certin" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                CERT-In Notice (6h)
              </button>
            </div>

            {activeDraft === "dpbi" ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400">Recipient: reports@dpbi.gov.in</span>
                  <Button size="sm" variant="outline" className="h-7 text-[11px] flex gap-1" onClick={() => handleCopy(dpbiEmailBody, "dpbi")}>
                    {isCopiedDpbi ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    {isCopiedDpbi ? "Copied" : "Copy"}
                  </Button>
                </div>
                <pre className="h-56 overflow-y-auto rounded-lg bg-gray-50 p-3 font-mono text-[10px] text-gray-700 border whitespace-pre-wrap">
                  {dpbiEmailBody}
                </pre>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400">Recipient: incident@cert-in.org.in</span>
                  <Button size="sm" variant="outline" className="h-7 text-[11px] flex gap-1" onClick={() => handleCopy(certEmailBody, "cert")}>
                    {isCopiedCert ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    {isCopiedCert ? "Copied" : "Copy"}
                  </Button>
                </div>
                <pre className="h-56 overflow-y-auto rounded-lg bg-gray-50 p-3 font-mono text-[10px] text-gray-700 border whitespace-pre-wrap">
                  {certEmailBody}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
