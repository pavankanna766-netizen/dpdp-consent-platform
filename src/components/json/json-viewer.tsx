"use client";

import { useState } from "react";

type Props = {
  value: unknown;
};

export function JsonViewer({
  value,
}: Props) {
  const [copied, setCopied] =
    useState(false);

  async function copy() {
    await navigator.clipboard.writeText(
      JSON.stringify(value, null, 2)
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <div className="rounded-xl border">

      <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">

        <h3 className="font-medium">
          JSON Payload
        </h3>

        <button
          onClick={copy}
          className="rounded-lg border px-3 py-1 text-sm hover:bg-white"
        >
          {copied
            ? "✓ Copied"
            : "📋 Copy"}
        </button>

      </div>

      <pre className="overflow-auto bg-slate-950 p-5 text-sm text-green-300">
{JSON.stringify(value, null, 2)}
      </pre>

    </div>
  );
}