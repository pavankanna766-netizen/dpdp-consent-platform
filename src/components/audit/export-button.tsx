"use client";

import Link from "next/link";

export function ExportButton() {
  return (
    <Link
      href="/audit/export"
      className="inline-flex rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-800"
    >
      Export CSV
    </Link>
  );
}