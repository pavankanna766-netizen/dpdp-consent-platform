"use client";

import { useTransition } from "react";
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

  function withdraw() {
    const confirmed = window.confirm(
      "Withdraw this consent?"
    );

    if (!confirmed) return;

    startTransition(async () => {
      await withdrawConsentAction(
        consentId
      );

      router.refresh();
    });
  }

  return (
    <Button
      variant="destructive"
      disabled={pending}
      onClick={withdraw}
    >
      {pending
        ? "Withdrawing..."
        : "Withdraw Consent"}
    </Button>
  );
}