import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateId } from "@/platform/core";

export interface ApiKeyRecord {
  id: string;
  company_id: string;
  key_name: string;
  api_key: string;
  environment: "production" | "development";
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export async function createApiKey(
  companyId: string,
  keyName: string = "Live SDK Key",
  environment: "production" | "development" = "production"
) {
  const prefix = environment === "production" ? "privy_live_" : "privy_test_";
  const apiKey = `${prefix}${generateId()}${generateId()}`;

  return supabaseAdmin
    .from("api_keys")
    .insert({
      company_id: companyId,
      key_name: keyName,
      api_key: apiKey,
      environment,
      is_active: true,
    })
    .select()
    .single();
}

export async function listCompanyApiKeys(companyId: string) {
  return supabaseAdmin
    .from("api_keys")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
}

export async function findApiKeyByValue(apiKey: string) {
  return supabaseAdmin
    .from("api_keys")
    .select("*")
    .eq("api_key", apiKey)
    .eq("is_active", true)
    .maybeSingle();
}

export async function validateApiKeyHeader(rawKey: string): Promise<ApiKeyRecord | null> {
  const { data } = await findApiKeyByValue(rawKey);
  if (data) {
    await recordApiKeyPing(rawKey);
  }
  return data || null;
}

export async function recordApiKeyPing(apiKey: string) {
  const now = new Date().toISOString();
  return supabaseAdmin
    .from("api_keys")
    .update({ last_used_at: now })
    .eq("api_key", apiKey)
    .select()
    .single();
}

export async function revokeApiKey(companyId: string, keyId: string) {
  return supabaseAdmin
    .from("api_keys")
    .update({ is_active: false })
    .eq("company_id", companyId)
    .eq("id", keyId)
    .select()
    .single();
}
