import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createFindings(
  findings: {
    scan_id: string;
    severity: string;
    title: string;
    recommendation: string;
    resolved: boolean;
  }[]
) {
  if (findings.length === 0) {
    return {
      data: [],
      error: null,
    };
  }

  return supabaseAdmin
    .from("scanner_findings")
    .insert(findings)
    .select();
}