"use client";

import { useState } from "react";
import { Info, HelpCircle, ShieldAlert, CheckCircle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DpbiGuidancePage() {
  const [userCount, setUserCount] = useState<number>(50000);
  const [hasMinorData, setHasMinorData] = useState<boolean>(false);
  const [hasSovereignRisk, setHasSovereignRisk] = useState<boolean>(false);
  const [industry, setIndustry] = useState<string>("SaaS");

  // SDF logic (DPDP Act Section 10)
  const isSdf = userCount >= 1000000 || hasMinorData || hasSovereignRisk || industry === "social-media";

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">🇮🇳 DPBI Filing Guidance & Fiduciary Status</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Obtain clear guidance for interacting with the **Data Protection Board of India (DPBI)** and assess your classification under the DPDP Act 2023.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Classification Calculator */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Scale className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Significant Data Fiduciary (SDF) Calculator</h2>
            </div>
            <p className="text-xs text-gray-500">
              The Government of India categorizes certain organizations as Significant Data Fiduciaries based on scale, risk, and impact (Section 10 of DPDP Act).
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold uppercase text-gray-500">Number of Active Indian Users</label>
                <div className="mt-1 flex items-center gap-4">
                  <input
                    type="range"
                    min="1000"
                    max="2000000"
                    step="10000"
                    value={userCount}
                    onChange={(e) => setUserCount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="w-24 text-right font-mono text-sm font-semibold text-gray-800">
                    {userCount >= 1000000 ? `${(userCount / 1000000).toFixed(1)}M` : userCount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-gray-500">Industry / Service Category</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="SaaS">SaaS Platform</option>
                  <option value="ecommerce">E-Commerce Brand</option>
                  <option value="fintech">Fintech / Lending</option>
                  <option value="healthtech">Healthcare / Healthtech</option>
                  <option value="social-media">Social Media Intermediary</option>
                </select>
              </div>

              <div className="flex flex-col gap-3.5 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasMinorData}
                    onChange={(e) => setHasMinorData(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-800">Process Data of Children / Minors</span>
                    <p className="text-xs text-gray-500">Triggers verifiable parental consent requirements (Section 9).</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSovereignRisk}
                    onChange={(e) => setHasSovereignRisk(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-800">Process Sovereign or Public Order Sensitive Data</span>
                    <p className="text-xs text-gray-500">Data relating to election systems, defense, or national security.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Obligations Details */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Your Classification Status</h3>

            {isSdf ? (
              <div className="flex gap-4 items-start bg-red-50 border border-red-200 rounded-xl p-4">
                <ShieldAlert className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-900">Significant Data Fiduciary (SDF) obligations apply</h4>
                  <p className="mt-1 text-xs text-red-700 leading-relaxed">
                    Under **Section 10 of the DPDP Act 2023**, your organization processed scale/risks mandate strict corporate governance:
                  </p>
                  <ul className="mt-3 list-disc pl-4 text-xs text-red-800 space-y-1.5">
                    <li>**Appoint a DPO:** Must designate a resident Data Protection Officer in India.</li>
                    <li>**Appoint a Data Auditor:** Retain an independent auditor for annual compliance audits.</li>
                    <li>**Conduct DPIA:** Perform annual Data Protection Impact Assessments mapping risks.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 items-start bg-green-50 border border-green-200 rounded-xl p-4">
                <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-green-900">Standard Data Fiduciary status</h4>
                  <p className="mt-1 text-xs text-green-700 leading-relaxed">
                    You currently have standard fiduciary obligations. However, you must still maintain **unambiguous consent ledgers (Section 6)** and **erasure capabilities (Section 8)**.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DPBI Contact & Filing details */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900">🏛️ Data Protection Board of India</h3>
            <p className="text-xs text-gray-500">
              The regulatory board designated to administer compliance, levy penalties, and hear complaints.
            </p>

            <div className="space-y-3 pt-2 text-xs text-gray-700">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-gray-900">Official Office Address</span>
                <p className="text-gray-600 bg-gray-50 p-2.5 rounded border">
                  Data Protection Board of India (DPBI),<br />
                  Ministry of Electronics and Information Technology (MeitY),<br />
                  Electronics Niketan, 6, CGO Complex,<br />
                  Lodhi Road, New Delhi - 110003
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-semibold text-gray-900">Filing Procedures</span>
                <ul className="list-decimal pl-4 space-y-1.5 text-gray-600 mt-1">
                  <li>**Inquiry Submissions:** Filed via the MeitY/DPBI online portal for data principal complaints.</li>
                  <li>**Breach Reports:** Notifications to DPBI must follow the CERT-In template formats immediately.</li>
                  <li>**Consent Revocation Audit:** Ledgers must be retrievable to demonstrate compliance in case of disputes.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/20 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-indigo-600" />
              <h4 className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">India Compliance Note</h4>
            </div>
            <p className="text-xs text-indigo-800 leading-relaxed font-medium">
              Failing to satisfy standard fiduciary duties (e.g. data breach or processing minor's data without parental consent) carries statutory penalties of up to **₹250 Crore** under Schedule 1 of the DPDP Act 2023.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
