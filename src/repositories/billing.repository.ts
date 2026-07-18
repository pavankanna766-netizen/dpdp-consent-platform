import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createBillingTransaction(values: {
  company_id: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  amount: number;
  currency: string;
  status: string;
}) {
  return supabaseAdmin
    .from("billing_transactions")
    .insert(values)
    .select()
    .single();
}

export async function updateCompanySubscription(
  companyId: string,
  values: {
    billing_status: string;
    plan_id: string;
    subscription_id?: string;
    current_period_end: string;
  }
) {
  return supabaseAdmin
    .from("companies")
    .update(values)
    .eq("id", companyId)
    .select()
    .single();
}

export async function getBillingTransactions(companyId: string) {
  return supabaseAdmin
    .from("billing_transactions")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
}
