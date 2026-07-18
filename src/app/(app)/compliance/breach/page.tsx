"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Clock, Copy, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BreachReportingPage() {
  const [detectedAt, setDetectedAt] = useState("");
  const [breachType, setBreachType] = useState("Unauthorised Access");
  const [affectedUsers, setAffectedUsers] = useState("100");
  const [dataCategories, setDataCategories] = useState("Name, Email, Mobile Number");
  const [description, setDescription] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isOverdue, setIsOverdue] = useState(false);

  // Calculate 6-hour CERT-In countdown
  useEffect(() => {
    if (!detectedAt) {
      setTimeRemaining("");
      return;
    }

    const interval = setInterval(() => {
      const detectTime = new Date(detectedAt).getTime();
      const limitTime = detectTime + 6 * 60 * 60 * 1000; // 6 hours later
      const now = Date.now();
      const difference = limitTime - now;

      if (difference <= 0) {
        setTimeRemaining("Reporting Window Expired (6-Hour Deadline Exceeded)");
        setIsOverdue(true);
        clearInterval(interval);
      } else {
        setIsOverdue(false);
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeRemaining(
          `${hours.toString().padStart(2, "0")}h ${minutes
            .toString()
            .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [detectedAt]);

  const emailBody = `To: incident@cert-in.org.in
Subject: INCIDENT REPORT - CERT-In 6-Hour Mandate Compliance

Dear CERT-In Incident Response Team,

We are writing to report a cybersecurity incident under the CERT-In Cyber Security Directions 2022.

--- INCIDENT SUMMARY ---
1. Type of Incident: ${breachType}
2. Time of Detection: ${detectedAt ? new Date(detectedAt).toLocaleString("en-IN") : "Pending"}
3. Categories of Systems/Data Affected: ${dataCategories}
4. Number of Impacted Users (Estimate): ${affectedUsers}
5. Description & Impact: ${description || "Details under investigation."}
6. Remedial Actions Taken: Isolated affected nodes, suspended compromised keys, and initiated forensic check.

Please assign an Incident Ticket ID and notify us of any further details required.

Sincerely,
Privacy & Security Compliance Team
[PrivyStack Customer Fiduciary]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(emailBody);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLogIncident = () => {
    setIsLogged(true);
    setTimeout(() => setIsLogged(false), 3000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">🇮🇳 CERT-In 6-Hour Incident Reporting</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Indian Cybersecurity Regulations (Directions 2022) mandate that all cybersecurity incidents must be reported to
          CERT-In within **6 hours** of detection.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Incident Details Form */}
        <div className="lg:col-span-3 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">Log Incident Details</h2>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="detected-at" className="text-xs font-semibold uppercase text-gray-500">
                Detection Time (IST)
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
                Incident Type
              </Label>
              <select
                id="breach-type"
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={breachType}
                onChange={(e) => setBreachType(e.target.value)}
              >
                <option>Unauthorised Access / Intrusion</option>
                <option>Ransomware Incident</option>
                <option>DDoS / Denial of Service</option>
                <option>Identity Theft / Phishing Attack</option>
                <option>Data Leak / Database Exposure</option>
              </select>
            </div>

            <div>
              <Label htmlFor="affected-users" className="text-xs font-semibold uppercase text-gray-500">
                Estimated Users Impacted
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
                Personal Data Leaked
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
                Incident Description & Mitigation Actions
              </Label>
              <textarea
                id="description"
                rows={4}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Details of how the breach occurred and steps taken to contain it..."
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
              {isLogged ? "Incident Logged in Audit Ledger! ✅" : "Log to Immutable Audit Logs"}
            </Button>
          </div>
        </div>

        {/* Countdown & Email Template */}
        <div className="lg:col-span-2 space-y-6">
          {/* Regulatory Timer */}
          <div className={`rounded-2xl border p-6 shadow-sm ${
            !detectedAt
              ? "bg-slate-50 border-slate-200 text-slate-500"
              : isOverdue
              ? "bg-red-50 border-red-200 text-red-700 animate-pulse"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}>
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6" />
              <h3 className="font-semibold uppercase tracking-wider text-xs">
                CERT-In 6-Hour Reporting Window
              </h3>
            </div>

            <div className="mt-4">
              {!detectedAt ? (
                <p className="text-sm font-medium">Please select incident detection time to start the regulatory timer.</p>
              ) : (
                <div>
                  <div className="text-3xl font-bold tracking-tight font-mono">{timeRemaining}</div>
                  <p className="mt-2 text-xs opacity-75">
                    Deadline: {new Date(new Date(detectedAt).getTime() + 6 * 60 * 60 * 1000).toLocaleString("en-IN")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Incident Template Copy Panel */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">CERT-In Report Draft</h3>
              <Button size="sm" variant="outline" className="flex items-center gap-1.5" onClick={handleCopy}>
                {isCopied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                {isCopied ? "Copied" : "Copy"}
              </Button>
            </div>

            <p className="text-xs text-gray-500">
              Copy this draft and email it directly to **incident@cert-in.org.in** to comply with the directions.
            </p>

            <pre className="h-64 overflow-y-auto rounded-lg bg-gray-50 p-3.5 font-mono text-[11px] text-gray-700 border whitespace-pre-wrap">
              {emailBody}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
