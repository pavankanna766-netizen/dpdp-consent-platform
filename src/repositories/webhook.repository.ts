import { supabaseAdmin } from "@/lib/supabase/admin";
import { cache } from "react";

export interface WebhookSubscriptionRecord {
  id: string;
  company_id: string;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  failure_count: number;
  disabled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookDeliveryRecord {
  id: string;
  company_id: string;
  subscription_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  signature: string;
  response_status: number | null;
  response_body: string | null;
  attempts: number;
  status: "delivered" | "failed" | "retrying" | "dlq";
  created_at: string;
}

export async function createWebhookSubscription(values: {
  company_id: string;
  url: string;
  events?: string[];
}) {
  const secret = `whsec_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;

  return supabaseAdmin
    .from("webhook_subscriptions")
    .insert({
      company_id: values.company_id,
      url: values.url,
      secret,
      events: values.events || ["*"],
      is_active: true,
    })
    .select()
    .single();
}

export const listWebhookSubscriptions = cache(async function (
  companyId: string
) {
  return supabaseAdmin
    .from("webhook_subscriptions")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
});

export async function deleteWebhookSubscription(companyId: string, subscriptionId: string) {
  return supabaseAdmin
    .from("webhook_subscriptions")
    .delete()
    .eq("company_id", companyId)
    .eq("id", subscriptionId);
}

export async function recordWebhookDelivery(values: {
  company_id: string;
  subscription_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  signature: string;
  response_status?: number;
  response_body?: string;
  status?: "delivered" | "failed" | "dlq";
}) {
  return supabaseAdmin.from("webhook_deliveries").insert({
    company_id: values.company_id,
    subscription_id: values.subscription_id,
    event_type: values.event_type,
    payload: values.payload,
    signature: values.signature,
    response_status: values.response_status || null,
    response_body: values.response_body || null,
    status: values.status || "delivered",
  });
}
