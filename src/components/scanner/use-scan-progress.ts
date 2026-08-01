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
  ] = useState<ScanProgress | null>(null);

  useEffect(() => {
    if (!scanId) {
      return;
    }

    let intervalId: NodeJS.Timeout | undefined;

    async function load() {
      try {
        const response = await fetch(
          `/api/scanner/progress/${scanId}`
        );

        if (!response.ok) {
          return;
        }

        const json = await response.json();
        const data = json.data ?? json;
        setProgress(data);

        if (
          data.status === "completed" ||
          data.status === "failed"
        ) {
          if (intervalId) {
            clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error("Failed to load scan progress:", error);
      }
    }

    load();

    intervalId = setInterval(load, 2000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [scanId]);

  return progress;
}