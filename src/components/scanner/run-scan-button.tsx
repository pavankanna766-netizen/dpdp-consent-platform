"use client";

import { useState } from "react";

import { useScanner } from "./scanner-context";

export function RunScanButton() {
  const [loading, setLoading] =
    useState(false);

  const {
    refresh,
    setStatus,
  } = useScanner();

  async function runScan() {
    try {
      setStatus("running");
      setLoading(true);

      const response =
        await fetch(
          "/api/scanner/scan",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

      if (!response.ok) {
        throw new Error(
          "Failed to start scan."
        );
      }

      setStatus(
        "completed"
      );

      refresh();
    } catch (error) {
      console.error(error);

      setStatus("failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={runScan}
      disabled={loading}
      className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
    >
      {loading
        ? "Scanning..."
        : "Run Scan"}
    </button>
  );
}