"use client";

import { useRouter } from "next/navigation";

interface Props {
  scanId: string;
}

export function GenerateCookiePolicyButton({
  scanId,
}: Props) {
  const router = useRouter();

  async function generate() {
    const response = await fetch(
      "/api/policies/cookies/generate",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          scanId,
        }),
      }
    );

    if (response.ok) {
      router.push(
        "/dashboard/policies/cookies"
      );
    }
  }

  return (
    <button
      onClick={generate}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      Generate Cookie Policy
    </button>
  );
}