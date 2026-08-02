"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Building2,
  Globe,
  ShieldCheck,
  Code2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveOnboardingStepAction,
  finishOnboardingAction,
  testSdkConnectionAction,
  generateApiKeyAction,
} from "@/app/actions/onboarding";
import { updateCompanyAction } from "@/app/actions/company";
import type { OnboardingState } from "@/services/onboarding.service";

interface Props {
  initialState: OnboardingState;
}

export function OnboardingWizard({ initialState }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [currentStep, setCurrentStep] = useState(
    initialState.company.onboarding_step || 1
  );
  const [companyName, setCompanyName] = useState(
    initialState.company.company_name
  );
  const [website, setWebsite] = useState(initialState.company.website || "");
  const [industry, setIndustry] = useState(
    initialState.company.industry || "Software & SaaS"
  );
  const [companySize, setCompanySize] = useState(
    initialState.company.company_size || "10-50 employees"
  );
  const [country, setCountry] = useState(initialState.company.country || "India");
  const [timezone, setTimezone] = useState(
    initialState.company.timezone || "Asia/Kolkata (IST)"
  );

  // Framework selection for SDK wizard
  const [selectedFramework, setSelectedFramework] = useState<
    "nextjs" | "react" | "html" | "express" | "nodejs"
  >("nextjs");

  // API Key and Connection testing
  const [apiKeys, setApiKeys] = useState(initialState.apiKeys);
  const activeKey = apiKeys[0]?.api_key || "";
  const [copiedKey, setCopiedKey] = useState(false);
  const [sdkStatus, setSdkStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  }>({
    tested: initialState.company.sdk_connected,
    success: initialState.company.sdk_connected,
    message: initialState.company.sdk_connected
      ? "SDK Ping Verified Successfully!"
      : "",
  });

  const completionPercentage = initialState.completionPercentage;

  const handleNextStep = (nextStep: number) => {
    setCurrentStep(nextStep);
    startTransition(async () => {
      await saveOnboardingStepAction(nextStep);
    });
  };

  const handleSkip = () => {
    startTransition(async () => {
      await finishOnboardingAction();
      router.push("/dashboard");
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateCompanyAction({
        company_name: companyName,
        website: website || null,
        industry,
        company_size: companySize,
        country,
        timezone,
        is_onboarded: false,
      });
      await saveOnboardingStepAction(2);
      setCurrentStep(2);
    });
  };

  const handleTestConnection = () => {
    if (!activeKey) return;
    startTransition(async () => {
      const res = await testSdkConnectionAction(activeKey);
      setSdkStatus({
        tested: true,
        success: res.success,
        message: res.message,
      });
    });
  };

  const handleGenerateKey = () => {
    startTransition(async () => {
      const newKey = await generateApiKeyAction("Live SDK Key", "production");
      if (newKey) {
        setApiKeys([newKey, ...apiKeys]);
      }
    });
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(activeKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleFinish = () => {
    startTransition(async () => {
      await finishOnboardingAction();
      router.push("/dashboard");
    });
  };

  // Framework code snippet generator
  const getSdkSnippet = () => {
    const key = activeKey || "privy_live_YOUR_API_KEY";
    switch (selectedFramework) {
      case "nextjs":
        return `// Next.js App Router (app/layout.tsx)
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.privystack.io/sdk.js"
          data-api-key="${key}"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}`;
      case "react":
        return `// React SPA (public/index.html or main.tsx)
<script 
  src="https://cdn.privystack.io/sdk.js" 
  data-api-key="${key}"
  async>
</script>`;
      case "html":
        return `<!-- HTML5 Direct Integration -->
<script 
  src="https://cdn.privystack.io/sdk.js" 
  data-api-key="${key}"
  async>
</script>`;
      case "express":
        return `// Node.js Express Middleware
const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.setHeader('X-PrivyStack-Key', '${key}');
  next();
});`;
      case "nodejs":
        return `// Node.js Server Environment
import { PrivyStackClient } from '@privystack/node';

const privy = new PrivyStackClient({
  apiKey: '${key}',
  environment: 'production'
});`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Progress Overview */}
      <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Welcome to PrivyStack <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Complete your DPDP Act 2023 compliance onboarding setup.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Profile Score</span>
              <p className="text-lg font-extrabold text-indigo-600">{completionPercentage}%</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip} className="text-xs text-gray-500 hover:text-gray-900">
              Skip & Configure Later →
            </Button>
          </div>
        </div>

        {/* 5-Step Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-5 text-center text-[10px] font-bold text-gray-400">
            <span className={currentStep >= 1 ? "text-indigo-600 font-bold" : ""}>1. Company</span>
            <span className={currentStep >= 2 ? "text-indigo-600 font-bold" : ""}>2. Scan</span>
            <span className={currentStep >= 3 ? "text-indigo-600 font-bold" : ""}>3. Policies</span>
            <span className={currentStep >= 4 ? "text-indigo-600 font-bold" : ""}>4. SDK Wizard</span>
            <span className={currentStep >= 5 ? "text-indigo-600 font-bold" : ""}>5. Verification</span>
          </div>
        </div>
      </div>

      {/* STEP 1: Company Legal Profile */}
      {currentStep === 1 && (
        <form onSubmit={handleSaveProfile} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" /> Step 1: Legal Company Profile
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Provide legal details required for statutory DPDP disclosures and privacy documents.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="company-name">Legal Entity Name</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Technologies Pvt Ltd"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="website">Primary Domain / Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry Sector</Label>
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option>Software & SaaS</option>
                <option>Fintech & Payments</option>
                <option>E-Commerce & Retail</option>
                <option>Healthcare & Healthtech</option>
                <option>EdTech</option>
                <option>Enterprise Services</option>
              </select>
            </div>

            <div>
              <Label htmlFor="company-size">Organization Size</Label>
              <select
                id="company-size"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option>1-10 employees</option>
                <option>10-50 employees</option>
                <option>50-250 employees</option>
                <option>250+ employees</option>
              </select>
            </div>

            <div>
              <Label htmlFor="country">Country of Incorporation</Label>
              <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1" required />
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="mt-1" required />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
              Save & Next Step <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 2: Website Scan */}
      {currentStep === 2 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-600" /> Step 2: Website Compliance Audit Scan
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Audit your domain for tracking scripts, cookies, and consent signals.
            </p>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-5 space-y-3">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Target Domain</h4>
            <p className="text-sm font-semibold text-indigo-700">{website || "https://example.com"}</p>
            <p className="text-xs text-indigo-600">
              Running a scan auto-populates your Data Inventory, Vendor Registry, and Cookie Policy categories.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => handleNextStep(1)} className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={() => handleNextStep(3)} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
              Proceed to Policies <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Policy Generator */}
      {currentStep === 3 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" /> Step 3: Statutory DPDP Disclosures
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Generate statutory privacy and cookie policy documents for your public disclosures.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-4 space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Privacy Policy</span>
              <p className="text-sm font-semibold text-gray-900">DPDP Act 2023 Compliant</p>
              <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Ready for Publication
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cookie Policy</span>
              <p className="text-sm font-semibold text-gray-900">Technical Category Breakdown</p>
              <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Ready for Publication
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => handleNextStep(2)} className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={() => handleNextStep(4)} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
              Continue to SDK Setup <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: SDK Installation Wizard */}
      {currentStep === 4 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Code2 className="h-5 w-5 text-indigo-600" /> Step 4: Multi-Framework SDK Wizard
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Embed the PrivyStack Consent SDK into your application to enforce visitor choices.
            </p>
          </div>

          {/* API Key Box */}
          <div className="rounded-xl border border-gray-200 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Your Live SDK API Key</span>
              <Button size="sm" variant="ghost" onClick={handleGenerateKey} className="text-xs text-indigo-600 hover:text-indigo-800">
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Regenerate Key
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg border bg-white px-3 py-2 text-xs font-mono text-gray-900 select-all">
                {activeKey || "Generating key..."}
              </code>
              <Button size="sm" onClick={handleCopyKey} variant="outline" className="flex items-center gap-1.5">
                {copiedKey ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                {copiedKey ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Framework Selection Tabs */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-700">Select Framework</span>
            <div className="flex flex-wrap gap-2 border-b pb-3">
              {(["nextjs", "react", "html", "express", "nodejs"] as const).map((fw) => (
                <button
                  key={fw}
                  type="button"
                  onClick={() => setSelectedFramework(fw)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                    selectedFramework === fw
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-gray-600 hover:bg-slate-200"
                  }`}
                >
                  {fw === "nextjs" ? "Next.js" : fw === "react" ? "React" : fw === "html" ? "HTML Script" : fw === "express" ? "Express" : "Node.js"}
                </button>
              ))}
            </div>

            {/* Code Display */}
            <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs font-mono text-slate-100">
              <code>{getSdkSnippet()}</code>
            </pre>
          </div>

          {/* Connection Tester */}
          <div className="rounded-xl border p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-800">Test SDK Connection</h4>
                <p className="text-[11px] text-gray-500">Verify live handshake between your website and PrivyStack servers.</p>
              </div>
              <Button
                onClick={handleTestConnection}
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5 text-xs"
              >
                <Zap className="h-3.5 w-3.5" /> Test Handshake
              </Button>
            </div>

            {sdkStatus.tested && (
              <div
                className={`rounded-lg p-3 text-xs font-semibold flex items-center gap-2 ${
                  sdkStatus.success ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {sdkStatus.success ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-red-600" />}
                {sdkStatus.message}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => handleNextStep(3)} className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={() => handleNextStep(5)} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
              View Checklist <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: Success Checklist */}
      {currentStep === 5 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b pb-3 text-center">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
              🎉 Onboarding Checklist Complete!
            </h2>
            <p className="text-xs text-gray-500 mt-1">Your organization is configured for DPDP Act 2023 compliance.</p>
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 text-xs font-semibold">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" /> Company Profile Registered
              </span>
              <span className="text-green-700 font-bold">100%</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 text-xs font-semibold">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" /> Initial Domain Audit Scan
              </span>
              <span className="text-green-700 font-bold">100%</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 text-xs font-semibold">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" /> DPDP Statutory Disclosures
              </span>
              <span className="text-green-700 font-bold">100%</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 text-xs font-semibold">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" /> Banner SDK API Key Configured
              </span>
              <span className="text-green-700 font-bold">100%</span>
            </div>
          </div>

          <div className="flex justify-center pt-4 border-t">
            <Button
              onClick={handleFinish}
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-sm font-bold shadow-md flex items-center gap-2"
            >
              Enter Compliance Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}