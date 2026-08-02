"use client";

import { useEffect, useState } from "react";

interface ScanProgress {
  status: string;
  stage: string;
  progress: number;
  estimatedSeconds?: number;
}

export function useScanProgress(scanId?: string) {
  const [progress, setProgress] = useState<ScanProgress | null>(null);

  useEffect(() => {
    if (!scanId) {
      return;
    }

    async function load() {
      try {
        const response = await fetch(`/api/scanner/progress/${scanId}`);

        if (!response.ok) {
          return;
        }

        const json = await response.json();
        const data = json.data ?? json;
        setProgress(data);
      } catch (error) {
        console.error("Failed to load scan progress:", error);
      }
    }

    load();
    const intervalId = setInterval(load, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [scanId]);

  return progress;
}