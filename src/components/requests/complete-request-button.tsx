"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { completeRequestAction } from "@/app/(app)/requests/[id]/actions";

type Props = {
  requestId: string;
};

export function CompleteRequestButton({
  requestId,
}: Props) {
  const router = useRouter();

  const [pending, startTransition] =
    useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await completeRequestAction(
            requestId
          );

          router.refresh();
        });
      }}
      className="rounded-lg bg-black px-6 py-3 text-white disabled:opacity-50"
    >
      {pending
        ? "Completing..."
        : "Complete Request"}
    </button>
  );
}