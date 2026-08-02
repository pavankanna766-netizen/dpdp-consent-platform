import { supabaseAdmin } from "@/lib/supabase/admin";
import { cache } from "react";

export type NotificationStatus = "queued" | "sent" | "delivered" | "bounced" | "failed";

export interface NotificationLogRecord {
  id: string;
  company_id: string;
  event_type: string;
  recipient_email: string;
  subject: string;
  provider: string;
  status: NotificationStatus;
  metadata: Record<string, unknown>;
  idempotency_key: string | null;
  created_at: string;
}

export interface NotificationPreferencesRecord {
  id: string;
  company_id: string;
  user_email: string;
  preferences: {
    security_alerts: boolean;
    dsar_updates: boolean;
    compliance_reminders: boolean;
    billing_notices: boolean;
  };
  created_at: string;
  updated_at: string;
}

export async function createNotificationLog(values: {
  company_id: string;
  event_type: string;
  recipient_email: string;
  subject: string;
  provider?: string;
  status?: NotificationStatus;
  metadata?: Record<string, unknown>;
  idempotency_key?: string;
}) {
  return supabaseAdmin
    .from("notification_logs")
    .insert({
      company_id: values.company_id,
      event_type: values.event_type,
      recipient_email: values.recipient_email,
      subject: values.subject,
      provider: values.provider || "resend",
      status: values.status || "sent",
      metadata: values.metadata || {},
      idempotency_key: values.idempotency_key || null,
    })
    .select()
    .single();
}

export const getNotificationPreferences = cache(async function (
  companyId: string,
  userEmail: string
) {
  const { data } = await supabaseAdmin
    .from("notification_preferences")
    .select("*")
    .eq("company_id", companyId)
    .eq("user_email", userEmail)
    .maybeSingle();

  if (data) return { data, error: null };

  // Default notification preferences
  return supabaseAdmin
    .from("notification_preferences")
    .insert({
      company_id: companyId,
      user_email: userEmail,
      preferences: {
        security_alerts: true,
        dsar_updates: true,
        compliance_reminders: true,
        billing_notices: true,
      },
    })
    .select()
    .single();
});

export async function updateNotificationPreferences(
  companyId: string,
  userEmail: string,
  preferences: Partial<NotificationPreferencesRecord["preferences"]>
) {
  const existingRes = await getNotificationPreferences(companyId, userEmail);
  const existing = existingRes.data?.preferences || {
    security_alerts: true,
    dsar_updates: true,
    compliance_reminders: true,
    billing_notices: true,
  };

  return supabaseAdmin
    .from("notification_preferences")
    .update({
      preferences: { ...existing, ...preferences },
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", companyId)
    .eq("user_email", userEmail)
    .select()
    .single();
}

export const listCompanyNotificationLogs = cache(async function (
  companyId: string
) {
  return supabaseAdmin
    .from("notification_logs")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
});
