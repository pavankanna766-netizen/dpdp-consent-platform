"use client";

import { useState } from "react";

export default function ScannerTestPage() {
  const [loading, setLoading] =
    useState(false);

  async function scan() {
  setLoading(true);

  try {
    const response = await fetch(
      "/api/scanner/scan",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://google.com",
        }),
      }
    );

    const text = await response.text();

    console.log("Status:", response.status);
    console.log("Response:", text);

    alert(
      `Status: ${response.status}\n\n${text}`
    );
  } catch (error) {
    console.error(error);
    alert("Request failed.");
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="p-10">
      <button
        onClick={scan}
        disabled={loading}
      >
        {loading
          ? "Scanning..."
          : "Start Scan"}
      </button>
    </main>
  );
}