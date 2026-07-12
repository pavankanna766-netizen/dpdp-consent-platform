import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createScan(
  values: {
    company_id: string;
    url: string;
    status: string;
    stage: string;
    progress: number;
    started_at: string;
  }
) {
  return supabaseAdmin
    .from("scanner_scans")
    .insert(values)
    .select()
    .single();
}

export async function updateScanProgress(
  id: string,
  values: {
    status?: string;
    stage?: string;
    progress?: number;
    cookies_found?: number;
    trackers_found?: number;
  }
) {
  return supabaseAdmin
    .from("scanner_scans")
    .update(values)
    .eq("id", id)
    .select()
    .single();
}

export async function completeScan(
  id: string,
  values: {
    status: string;
    completed_at: string;
    duration_ms: number;
    overall_score: number;
    cookies_found: number;
    trackers_found: number;
    findings_count: number;
    stage: string;
    progress: number;
  }
) {
  return supabaseAdmin
    .from("scanner_scans")
    .update(values)
    .eq("id", id)
    .select()
    .single();
}

export async function getScan(
  id: string
) {
  return supabaseAdmin
    .from("scanner_scans")
    .select("*")
    .eq("id", id)
    .single();
}

export async function getLatestScan(
  companyId: string
) {
  return supabaseAdmin
    .from("scanner_scans")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .single();
}

export async function listRecentScans(
  companyId: string,
  limit = 10
) {
  return supabaseAdmin
    .from("scanner_scans")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);
}

export async function getScanSummary(
  scanId: string
) {
  const [
    scan,
    detections,
    findings,
  ] = await Promise.all([
    supabaseAdmin
      .from("scanner_scans")
      .select("*")
      .eq("id", scanId)
      .single(),

    supabaseAdmin
      .from(
        "scanner_detections"
      )
      .select("*")
      .eq("scan_id", scanId),

    supabaseAdmin
      .from(
        "scanner_findings"
      )
      .select("*")
      .eq("scan_id", scanId),
  ]);

  return {
    scan: scan.data,

    detections:
      detections.data ?? [],

    findings:
      findings.data ?? [],
  };
}

export async function getScanJob(
  id: string
) {
  return supabaseAdmin
    .from("scanner_scans")
    .select(
      `
      id,
      status,
      stage,
      progress,
      cookies_found,
      trackers_found,
      started_at,
      completed_at
      `
    )
    .eq("id", id)
    .single();
}

export async function getTrendHistory(
  companyId: string,
  limit = 10
) {
  return supabaseAdmin
    .from("scanner_scans")
    .select(`
      id,
      overall_score,
      created_at
    `)
    .eq("company_id", companyId)
    .eq("status", "completed")
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);
}