"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { withdrawConsentAction } from "@/app/(app)/consents/[id]/actions";

type Props = {
  consentId: string;
};

export function WithdrawButton({
  consentId,
}: Props) {
  const router = useRouter();

  const [pending, startTransition] =
    useTransition();
  const [error, setError] = useState<string | null>(null);

  function withdraw() {
    const confirmed = window.confirm(
      "Withdraw this consent?"
    );

    if (!confirmed) return;

    setError(null);

    startTransition(async () => {
      try {
        await withdrawConsentAction(consentId);
        router.refresh();
      } catch {
        setError(
          "Consent could not be withdrawn. Please try again."
        );
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        variant="destructive"
        disabled={pending}
        onClick={withdraw}
      >
        {pending
          ? "Withdrawing..."
          : "Withdraw Consent"}
      </Button>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
