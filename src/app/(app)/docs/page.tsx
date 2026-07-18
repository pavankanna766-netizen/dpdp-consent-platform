"use client";

import { useState } from "react";
import { Terminal, Code2, BookOpen, Key, Link2, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

const SNIPPETS = {
  javascript: `<script
  src="https://cdn.privystack.in/banner.js"
  data-banner="YOUR_BANNER_EMBED_TOKEN"
  data-language="en"
></script>

<script>
  // Listen for consent preference changes
  window.addEventListener('privystack:consent', function(e) {
    const preferences = e.detail.categories;
    
    if (preferences.analytics) {
      // Initialize Google Analytics, Mixpanel, etc.
      initAnalytics();
    }
    
    if (preferences.marketing) {
      // Load Facebook Pixel, AdWords, etc.
      initPixel();
    }
  });
</script>`,

  react: `import { useEffect } from 'react';

export function PrivacyProvider({ children }) {
  useEffect(() => {
    // Load embeddable banner
    const script = document.createElement('script');
    script.src = "https://cdn.privystack.in/banner.js";
    script.setAttribute('data-banner', 'YOUR_BANNER_EMBED_TOKEN');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <>{children}</>;
}`,

  node: `const fetch = require('node-fetch');

// Submit programmatic consent (API Integration)
async function recordUserConsent(userId, categories) {
  const response = await fetch('https://api.privystack.in/api/public/consent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': \`consent_\${userId}_\${Date.now()}\`
    },
    body: JSON.stringify({
      subjectIdentifier: userId,
      templateToken: 'YOUR_TEMPLATE_TOKEN',
      decision: 'accepted',
      categories: {
        analytics: categories.analytics || false,
        marketing: categories.marketing || false,
        functional: categories.functional || true,
        personalization: categories.personalization || false
      }
    })
  });

  const result = await response.json();
  return result;
}`,

  curl: `curl -X POST https://api.privystack.in/api/public/consent \\
  -H "Content-Type: application/json" \\
  -H "X-Idempotency-Key: const_unique_id_12345" \\
  -d '{
    "subjectIdentifier": "user_id_9921",
    "templateToken": "YOUR_TEMPLATE_TOKEN",
    "decision": "accepted",
    "categories": {
      "analytics": true,
      "marketing": false,
      "functional": true,
      "personalization": false
    }
  }'`
};

export default function DevDocsPage() {
  const [activeTab, setActiveTab] = useState<keyof typeof SNIPPETS>("javascript");
  const [copiedText, setCopiedText] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPETS[activeTab]);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">💻 Developer Documentation</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Integrate the PrivyStack embeddable script and programmatically record DPDP consents via REST API.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Guide and Endpoints */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Quick Integration
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              To load the DPDP cookie consent banner on your website, copy the script tag from the Templates editor and paste it in the <code>&lt;head&gt;</code> of your website.
            </p>
            <div className="text-xs text-gray-700 space-y-2.5 border-t pt-3">
              <span className="font-semibold text-gray-900">Supported Headers:</span>
              <ul className="list-disc pl-4 space-y-1 text-gray-600">
                <li>`idempotency-key` - Prevent duplicates</li>
                <li>`origin` - CORS validation</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Link2 className="h-5 w-5 text-indigo-600" />
              API Endpoints
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <span className="font-semibold text-indigo-600 uppercase tracking-wider text-[10px]">POST</span>
                <code className="ml-2 bg-gray-50 px-1.5 py-0.5 rounded border">/api/public/consent</code>
                <p className="mt-1 text-[11px] text-gray-500">Record visitor consent ledger record.</p>
              </div>
              <div className="border-t pt-3">
                <span className="font-semibold text-green-600 uppercase tracking-wider text-[10px]">GET</span>
                <code className="ml-2 bg-gray-50 px-1.5 py-0.5 rounded border">/api/public/template/[token]</code>
                <p className="mt-1 text-[11px] text-gray-500">Fetch dynamic bilingual template notice text.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Snippets Panel */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="border-b px-6 py-4 bg-slate-50/50 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("javascript")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "javascript" ? "bg-white text-indigo-600 shadow-sm border border-indigo-100" : "text-gray-500 hover:bg-slate-100"
                }`}
              >
                Vanilla JS (Browser)
              </button>
              <button
                onClick={() => setActiveTab("react")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "react" ? "bg-white text-indigo-600 shadow-sm border border-indigo-100" : "text-gray-500 hover:bg-slate-100"
                }`}
              >
                React / Next.js
              </button>
              <button
                onClick={() => setActiveTab("node")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "node" ? "bg-white text-indigo-600 shadow-sm border border-indigo-100" : "text-gray-500 hover:bg-slate-100"
                }`}
              >
                Node.js (Backend)
              </button>
              <button
                onClick={() => setActiveTab("curl")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "curl" ? "bg-white text-indigo-600 shadow-sm border border-indigo-100" : "text-gray-500 hover:bg-slate-100"
                }`}
              >
                cURL
              </button>
            </div>

            <Button size="sm" variant="outline" className="flex items-center gap-1.5" onClick={handleCopy}>
              {copiedText ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copiedText ? "Copied" : "Copy Code"}
            </Button>
          </div>

          <pre className="flex-1 bg-[#1e1e1e] p-6 font-mono text-xs text-gray-200 overflow-x-auto whitespace-pre leading-relaxed border-t border-b select-all">
            {SNIPPETS[activeTab]}
          </pre>

          <div className="px-6 py-4 bg-slate-50/50 text-[10px] text-gray-400 flex items-center gap-1.5">
            <Terminal className="h-4 w-4 text-gray-400" />
            Integrations require an active SSL (HTTPS) environment. Localhost matches wildcard CORS profiles automatically.
          </div>
        </div>
      </div>
    </div>
  );
}
