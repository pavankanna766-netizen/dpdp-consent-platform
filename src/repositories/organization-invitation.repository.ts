import { supabaseAdmin } from "@/lib/supabase/admin";
import { cache } from "react";
import type { OrgRole } from "@/platform/permissions/rbac";

export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

export interface CompanyInvitationRecord {
  id: string;
  company_id: string;
  email: string;
  role: OrgRole;
  token: string;
  invited_by: string;
  expires_at: string;
  status: InvitationStatus;
  created_at: string;
  updated_at: string;
}

export async function createCompanyInvitation(values: {
  company_id: string;
  email: string;
  role: OrgRole;
  invited_by: string;
}) {
  const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

  return supabaseAdmin
    .from("company_invitations")
    .insert({
      company_id: values.company_id,
      email: values.email,
      role: values.role,
      token,
      invited_by: values.invited_by,
      status: "pending",
    })
    .select()
    .single();
}

export const getInvitationByToken = cache(async function (token: string) {
  return supabaseAdmin
    .from("company_invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .gte("expires_at", new Date().toISOString())
    .maybeSingle();
});

export async function updateInvitationStatus(
  id: string,
  status: InvitationStatus
) {
  return supabaseAdmin
    .from("company_invitations")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
}

export const listCompanyInvitations = cache(async function (
  companyId: string
) {
  return supabaseAdmin
    .from("company_invitations")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
});
