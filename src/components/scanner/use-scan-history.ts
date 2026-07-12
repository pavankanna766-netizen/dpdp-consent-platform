"use client";

import {
  useQuery,
} from "@tanstack/react-query";

export interface ScanHistoryItem {
  id: string;
  url: string;
  overall_score: number;
  cookies_found: number;
  trackers_found: number;
  findings_count: number;
  created_at: string;
  status: string;
}

export function useScanHistory() {
  return useQuery<
    ScanHistoryItem[]
  >({
    queryKey: [
      "scan-history",
    ],

    queryFn: async () => {
      const response =
        await fetch(
          "/api/scanner/history"
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load scan history."
        );
      }

      return response.json();
    },
  });
}