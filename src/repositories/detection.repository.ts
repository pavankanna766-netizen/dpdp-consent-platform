import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createDetections(
  detections: {
    scan_id: string;
    provider: string;
    category: string;
    confidence: number;
    matched_by: string;
    requires_consent: boolean;
    description: string;
  }[]
) {
  if (detections.length === 0) {
    return {
      data: [],
      error: null,
    };
  }

  return supabaseAdmin
    .from("scanner_detections")
    .insert(detections)
    .select();
}