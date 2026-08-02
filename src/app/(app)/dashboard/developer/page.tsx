import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import { listCompanyApiKeys } from "@/repositories/api-key.repository";
import { listWebhookSubscriptions } from "@/repositories/webhook.repository";
import { entitlementService } from "@/services/entitlement.service";
import { Key, Webhook, Code, ShieldCheck, Zap, FileText } from "lucide-react";

export default async function DeveloperPortalPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const company = await ensureCompany(userId, "My Company");
  const companyId = company.id;

  const [keysRes, webhooksRes, planRes] = await Promise.all([
    listCompanyApiKeys(companyId),
    listWebhookSubscriptions(companyId),
    entitlementService.getPlanConfig(companyId),
  ]);

  const keys = keysRes.data || [];
  const webhooks = webhooksRes.data || [];
  const plan = planRes.config;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <Code className="h-8 w-8 text-indigo-600" />
            Developer Platform & API Portal
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your API keys, webhook endpoints, SDK configurations, and rate limits for statutory DPDP automation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/v1/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 transition"
          >
            <FileText className="h-4 w-4 text-slate-600" />
            OpenAPI 3.1 Spec
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm font-medium">
            <span>API Rate Limit</span>
            <Zap className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {plan.limits.monthlyApiRequests.toLocaleString()} <span className="text-xs font-normal text-slate-500">req/mo</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{plan.name} Tier Plan</p>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm font-medium">
            <span>Active API Keys</span>
            <Key className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{keys.length}</div>
          <p className="text-xs text-slate-500 mt-1">SHA-256 Hashed Secrets</p>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm font-medium">
            <span>Webhook Endpoints</span>
            <Webhook className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{webhooks.length}</div>
          <p className="text-xs text-slate-500 mt-1">HMAC Signed Deliveries</p>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm font-medium">
            <span>OWASP Security</span>
            <ShieldCheck className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">Enforced</div>
          <p className="text-xs text-slate-500 mt-1">Replay & Tenant Isolation</p>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Active API Keys</h2>
            <p className="text-xs text-slate-500">API keys grant programmatic access to your tenant dataset.</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
          {keys.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No API keys created yet.</div>
          ) : (
            keys.map((k) => (
              <div key={k.id} className="p-4 flex items-center justify-between text-sm">
                <div>
                  <div className="font-semibold text-slate-900">{k.key_name}</div>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">{k.api_key}</div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                  <div className="text-xs text-slate-400 mt-1">
                    Last ping: {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SDK Quickstart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg text-slate-100 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Code className="h-5 w-5 text-indigo-400" />
          TypeScript / Node.js SDK Quickstart
        </h2>
        <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-indigo-300 overflow-x-auto border border-slate-800">
          <pre>{`import { PrivyStackClient } from "@privystack/sdk";

const client = new PrivyStackClient({
  apiKey: "pk_live_your_secret_api_key",
});

// Fetch latest statutory privacy scan finding
const scan = await client.getLatestScan();
console.log("Privacy Score:", scan.overall_score);`}</pre>
        </div>
      </div>
    </div>
  );
}
