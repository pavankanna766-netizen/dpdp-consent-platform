import { supabaseAdmin } from "@/lib/supabase/admin";
import { cache } from "react";
import type { PlanTier } from "@/platform/billing/plans";

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "paused";

export interface SubscriptionRecord {
  id: string;
  company_id: string;
  plan_tier: PlanTier;
  billing_cycle: "monthly" | "yearly";
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  razorpay_customer_id: string | null;
  razorpay_subscription_id: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyUsageRecord {
  id: string;
  company_id: string;
  scans_count: number;
  api_requests_count: number;
  policies_generated_count: number;
  pdf_exports_count: number;
  billing_period_start: string;
  updated_at: string;
}

export const getCompanySubscription = cache(async function (companyId: string) {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();

  if (data) return { data: data as SubscriptionRecord, error: null };

  // Default fallback subscription for new tenants
  return supabaseAdmin
    .from("subscriptions")
    .insert({
      company_id: companyId,
      plan_tier: "starter",
      status: "active",
    })
    .select()
    .single();
});

export async function updateSubscriptionPlan(
  companyId: string,
  planTier: PlanTier,
  billingCycle: "monthly" | "yearly" = "monthly"
) {
  return supabaseAdmin
    .from("subscriptions")
    .update({
      plan_tier: planTier,
      billing_cycle: billingCycle,
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", companyId)
    .select()
    .single();
}

export const getCompanyUsage = cache(async function (companyId: string) {
  const { data } = await supabaseAdmin
    .from("company_usage")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();

  if (data) return { data: data as CompanyUsageRecord, error: null };

  return supabaseAdmin
    .from("company_usage")
    .insert({
      company_id: companyId,
      scans_count: 0,
      api_requests_count: 0,
      policies_generated_count: 0,
      pdf_exports_count: 0,
    })
    .select()
    .single();
});

export async function incrementUsageMetric(
  companyId: string,
  metric: "scans" | "api_requests" | "policies" | "pdf_exports"
) {
  const usageRes = await getCompanyUsage(companyId);
  const current = usageRes.data || {
    scans_count: 0,
    api_requests_count: 0,
    policies_generated_count: 0,
    pdf_exports_count: 0,
  };

  const updates: Record<string, number> = {};
  if (metric === "scans") updates.scans_count = current.scans_count + 1;
  if (metric === "api_requests") updates.api_requests_count = current.api_requests_count + 1;
  if (metric === "policies") updates.policies_generated_count = current.policies_generated_count + 1;
  if (metric === "pdf_exports") updates.pdf_exports_count = current.pdf_exports_count + 1;

  return supabaseAdmin
    .from("company_usage")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", companyId)
    .select()
    .single();
}
