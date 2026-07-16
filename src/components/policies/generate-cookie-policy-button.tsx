"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function GenerateCookiePolicyButton() {
  const router = useRouter();

  const [pending, start] =
    useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          await fetch(
            "/api/policies/cookies/generate",
            {
              method: "POST",
            }
          );

          router.refresh();
        })
      }
      className="rounded-lg bg-black px-4 py-2 text-white"
    >
      {pending
        ? "Generating..."
        : "Generate"}
    </button>
  );
}