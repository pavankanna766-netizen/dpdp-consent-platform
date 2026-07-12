"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import type {
  ScanJob,
} from "@/modules/scanner/domain/job";

export function useScanJob(
  scanId: string | null
) {
  return useQuery<ScanJob>({
    queryKey: [
      "scan-job",
      scanId,
    ],

    enabled:
      !!scanId,

    queryFn: async () => {
      const response =
        await fetch(
          `/api/scanner/${scanId}/status`
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load scan."
        );
      }

      return response.json();
    },

    refetchInterval:
      (query) => {
        const status =
          query.state.data
            ?.status;

        return status ===
            "completed" ||
          status ===
            "failed"
          ? false
          : 1000;
      },
  });
}