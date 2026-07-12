"use client";

import {
  useEffect,
  useState,
} from "react";

interface ScanProgress {
  status: string;

  stage: string;

  progress: number;

  estimatedSeconds?: number;
}

export function useScanProgress(
  scanId?: string
) {
  const [
    progress,
    setProgress,
  ] =
    useState<ScanProgress | null>(
      null
    );

  useEffect(() => {
    if (!scanId) {
      return;
    }

    async function load() {
      const response =
        await fetch(
          `/api/scanner/progress/${scanId}`
        );

      if (!response.ok) {
        return;
      }

      const json =
        await response.json();

      setProgress(json);

      if (
        json.status ===
          "completed" ||
        json.status ===
          "failed"
      ) {
        if (interval) {
          clearInterval(
            interval
          );
        }
      }
    }

    load();

   const interval =
      setInterval(
        load,
        2000
      );

    return () => {
        clearInterval(
          interval
        );
    };
  }, [scanId]);

  return progress;
}