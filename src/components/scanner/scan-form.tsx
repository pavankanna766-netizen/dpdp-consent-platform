"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  useCompany,
} from "./use-company";

import {
  useScanner,
} from "./scanner-context";

export function ScanForm() {
  const {
    data: company,
  } = useCompany();

  const [loading, setLoading] =
    useState(false);

  const {
    refresh,
    setStatus,
  } = useScanner();

 const initialUrl = useMemo(
  () => company?.website ?? "",
  [company]
);

const [url, setUrl] =
  useState(initialUrl);

  async function runScan() {
    if (!url.trim()) {
      alert(
        "Please enter a website URL."
      );
      return;
    }

    try {
      setLoading(true);

      setStatus(
        "running"
      );

      const response =
        await fetch(
          "/api/scanner/scan",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                url,
              }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Failed to start scan."
        );
      }

      refresh();

      setStatus(
        "completed"
      );
    } catch (error) {
      console.error(error);

      setStatus(
        "failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border p-5">
      <h2 className="mb-4 text-lg font-semibold">
        Scan Website
      </h2>

      <input
        type="url"
        value={url}
        onChange={(e) =>
          setUrl(
            e.target.value
          )
        }
        placeholder="https://example.com"
        className="w-full rounded-lg border px-3 py-2"
      />

      <button
        onClick={runScan}
        disabled={loading}
        className="mt-4 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading
          ? "Scanning..."
          : "Run Scan"}
      </button>
    </div>
  );
}