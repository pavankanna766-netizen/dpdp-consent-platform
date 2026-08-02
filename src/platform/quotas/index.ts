import { getCompanySubscription } from "@/repositories/subscription.repository";
import { PLAN_CONFIGS, type PlanTier } from "@/platform/billing/plans";
import { listAuditLogs } from "@/repositories/audit.repository";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface CompanyQuotaStatus {
  company_id: string;
  plan_id: string;
  api_requests: {
    used: number;
    limit: number;
    percentage: number;
    is_warning: boolean;
    is_exceeded: boolean;
  };
  scanner_runs: {
    used: number;
    limit: number;
    percentage: number;
    is_warning: boolean;
    is_exceeded: boolean;
  };
  legal_exports: {
    used: number;
    limit: number;
    percentage: number;
    is_warning: boolean;
    is_exceeded: boolean;
  };
}

export async function getCompanyQuotaStatus(companyId: string): Promise<CompanyQuotaStatus> {
  const subRes = await getCompanySubscription(companyId);
  const planId = (subRes.data?.plan_id || "starter") as PlanTier;
  const plan = PLAN_CONFIGS[planId] || PLAN_CONFIGS.starter;

  // 1. Fetch API request usage from audit logs for current month
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const auditRes = await listAuditLogs(companyId, { from: firstDayOfMonth, pageSize: 1 });
  const apiUsed = auditRes.count ?? 0;

  // 2. Fetch Scanner runs usage
  const { count: scanCount } = await supabaseAdmin
    .from("scanner_history")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .gte("created_at", firstDayOfMonth);
  const scannerUsed = scanCount ?? 0;

  // 3. Fetch Legal export usage
  const { count: exportCount } = await supabaseAdmin
    .from("export_jobs")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .gte("created_at", firstDayOfMonth);
  const exportsUsed = exportCount ?? 0;

  const apiLimit = plan.limits.monthlyApiRequests || 10000;
  const scannerLimit = plan.limits.monthlyScans || 5;
  const exportsLimit = plan.limits.monthlyPoliciesGenerated || 10;

  const calcStatus = (used: number, limit: number) => {
    const percentage = Math.min(100, Math.round((used / limit) * 100));
    return {
      used,
      limit,
      percentage,
      is_warning: percentage >= 80 && percentage < 100,
      is_exceeded: used >= limit,
    };
  };

  return {
    company_id: companyId,
    plan_id: planId,
    api_requests: calcStatus(apiUsed, apiLimit),
    scanner_runs: calcStatus(scannerUsed, scannerLimit),
    legal_exports: calcStatus(exportsUsed, exportsLimit),
  };
}
