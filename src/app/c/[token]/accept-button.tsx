"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { acceptConsentAction } from "./actions";

type Props = {
  token: string;
};

export function AcceptButton({
  token,
}: Props) {
  const router = useRouter();

  const [pending, startTransition] =
    useTransition();

  function accept() {
    startTransition(async () => {
      await acceptConsentAction(token);

      router.push(
        `/c/${token}/success`
      );
    });
  }

  return (
    <Button
      onClick={accept}
      disabled={pending}
      className="w-full mt-6"
    >
      {pending
        ? "Saving..."
        : "Accept Consent"}
    </Button>
  );
}