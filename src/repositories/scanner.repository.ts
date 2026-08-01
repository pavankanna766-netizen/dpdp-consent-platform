import { supabaseAdmin } from "@/lib/supabase/admin";

import { cache } from "react";

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
  companyId: string,
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
    .eq("company_id", companyId)
    .eq("id", id)
    .select()
    .single();
}

export async function completeScan(
  companyId: string,
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
    .eq("company_id", companyId)
    .eq("id", id)
    .select()
    .single();
}

export const getScan = cache(async function (
  companyId: string,
  id: string
) {
  return supabaseAdmin
    .from("scanner_scans")
    .select("*")
    .eq("company_id", companyId)
    .eq("id", id)
    .single();
});

export const getLatestScan = cache(async function (
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
});

export const listRecentScans = cache(async function (
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
});

export const getScanSummary = cache(async function (
  companyId: string,
  scanId: string
) {
  // First verify the scan belongs to this company (tenant isolation)
  const scan = await supabaseAdmin
    .from("scanner_scans")
    .select("*")
    .eq("company_id", companyId)
    .eq("id", scanId)
    .single();

  // If the scan doesn't belong to this company, return empty results
  if (scan.error || !scan.data) {
    return {
      scan: null,
      detections: [],
      findings: [],
    };
  }

  // Only query child tables after confirming company ownership
  const [detections, findings] = await Promise.all([
    supabaseAdmin
      .from("scanner_detections")
      .select("*")
      .eq("scan_id", scanId),

    supabaseAdmin
      .from("scanner_findings")
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
});

export const getScanJob = cache(async function (
  companyId: string,
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
    .eq("company_id", companyId)
    .eq("id", id)
    .single();
});

export const getTrendHistory = cache(async function (
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
});