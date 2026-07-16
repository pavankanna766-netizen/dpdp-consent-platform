"use client";

interface Props {
  code: string;
}

export function EmbedCode({
  code,
}: Props) {
  async function copy() {
    await navigator.clipboard.writeText(
      code
    );
  }

  return (
    <div className="rounded-xl border p-5">

      <div className="font-semibold">
        Installation Script
      </div>

      <textarea
        readOnly
        value={code}
        className="mt-4 h-28 w-full rounded-lg border p-3 font-mono text-sm"
      />

      <button
        onClick={copy}
        className="mt-4 rounded-lg bg-black px-4 py-2 text-white"
      >
        Copy Script
      </button>

    </div>
  );
}