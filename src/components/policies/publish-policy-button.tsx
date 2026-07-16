"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
}

export function PublishPolicyButton({
  id,
}: Props) {
  const router = useRouter();

  const [pending, start] =
    useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          await fetch(
            "/api/policies/privacy/publish",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                id,
              }),
            }
          );

          router.refresh();
        })
      }
      className="rounded-lg border px-4 py-2"
    >
      {pending
        ? "Publishing..."
        : "Publish"}
    </button>
  );
}