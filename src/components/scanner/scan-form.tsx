"use client";

import { useEffect, useState } from "react";
import { useCompany } from "./use-company";
import { useScanner } from "./scanner-context";

export function ScanForm() {
  const { data: company } = useCompany();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refresh, setStatus } = useScanner();

  const [url, setUrl] = useState("");

  useEffect(() => {
    if (company?.website && !url) {
      setUrl(company.website);
    }
  }, [company, url]);

  async function runScan() {
    setError(null);
    if (!url.trim()) {
      setError("Please enter a valid website URL.");
      return;
    }

    try {
      setLoading(true);
      setStatus("running");

      const response = await fetch("/api/scanner/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || json.message || "Failed to start scan.");
      }

      refresh();
      setStatus("completed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start scan.";
      setError(msg);
      setStatus("failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Scan Website</h2>

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <input
        type="url"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          if (error) setError(null);
        }}
        placeholder="https://example.com"
        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />

      <button
        onClick={runScan}
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Scanning Website..." : "Run Scan"}
      </button>
    </div>
  );
}