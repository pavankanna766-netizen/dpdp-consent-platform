"use client";

import { useTransition } from "react";

interface Props {
  id: string;
}

export function PublishBannerButton({
  id,
}: Props) {
  const [
    pending,
    startTransition,
  ] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await fetch(
            `/api/banner/${id}`,
            {
              method: "POST",
            }
          );
        })
      }
      className="rounded-lg bg-black px-4 py-2 text-white"
    >
      {pending
        ? "Publishing..."
        : "Publish"}
    </button>
  );
}