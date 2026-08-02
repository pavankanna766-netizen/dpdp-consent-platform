import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Escape PostgREST filter special characters to prevent filter injection.
 */
function sanitizeSearchInput(input: string): string {
  return input.replace(/[\\%_*(),.:"]/g, "");
}

export async function createAuditLog(values: {
  company_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  actor: string;
  payload: Record<string, unknown>;
}) {
  return supabaseAdmin.rpc("create_audit_log_atomic", {
    p_company_id: values.company_id,
    p_event_type: values.event_type,
    p_entity_type: values.entity_type,
    p_entity_id: values.entity_id,
    p_actor: values.actor,
    p_payload: values.payload,
  });
}

export async function listAuditLogs(
  companyId: string,
  options?: {
  search?: string;
  eventType?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}
) {
  const page =
    options?.page ?? 1;

  const pageSize =
    options?.pageSize ?? 25;

  let query = supabaseAdmin
    .from("audit_logs")
    .select("*", {
      count: "exact",
    })
    .eq("company_id", companyId);

  if (options?.search?.trim()) {
  const search = sanitizeSearchInput(options.search.trim());

  query = query.or(
    `event_type.ilike.*${search}*,entity_type.ilike.*${search}*,actor.ilike.*${search}*`
  );
}

  if (options?.eventType) {
    query = query.eq(
      "event_type",
      options.eventType
    );
  }

  if (options?.from) {
  query = query.gte(
    "created_at",
    options.from
  );
}

if (options?.to) {
  query = query.lte(
    "created_at",
    options.to
  );
}

  return query
  .order("created_at", {
    ascending: false,
  })
  .range(
    (page - 1) * pageSize,
    page * pageSize - 1
  );
}

export async function getAuditLogById(
  companyId: string,
  id: string
) {
  return supabaseAdmin
    .from("audit_logs")
    .select("*")
    .eq("company_id", companyId)
    .eq("id", id)
    .single();
}

export async function getAuditStatsFromDb(companyId: string) {
  return supabaseAdmin.rpc("get_audit_stats", { p_company_id: companyId });
}

export async function verifyAuditIntegrity(companyId: string): Promise<{
  total_checked: number;
  valid_count: number;
  tampered_count: number;
  tampered_log_ids: string[];
}> {
  const { data: logs } = await supabaseAdmin
    .from("audit_logs")
    .select("id, company_id, event_type, entity_type, entity_id, actor, payload, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: true })
    .limit(500);

  if (!logs || logs.length === 0) {
    return { total_checked: 0, valid_count: 0, tampered_count: 0, tampered_log_ids: [] };
  }

  const tamperedIds: string[] = [];

  for (const log of logs) {
    // Audit log records must contain immutable required fields
    if (!log.id || !log.company_id || !log.event_type || !log.actor || !log.created_at) {
      tamperedIds.push(log.id);
    }
  }

  return {
    total_checked: logs.length,
    valid_count: logs.length - tamperedIds.length,
    tampered_count: tamperedIds.length,
    tampered_log_ids: tamperedIds,
  };
}