import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createAuditLog(values: {
  company_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  actor: string;
  payload: Record<string, unknown>;
}) {
  return supabaseAdmin
    .from("audit_logs")
    .insert({
      ...values,
    })
    .select()
    .single();
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
  const search = options.search.trim();

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
  id: string
) {
  return supabaseAdmin
    .from("audit_logs")
    .select("*")
    .eq("id", id)
    .single();
}