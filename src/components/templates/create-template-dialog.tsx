"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { TemplateForm } from "./template-form";

import { createTemplateAction } from "@/app/(app)/templates/actions";

import type { TemplateValues } from "@/app/(app)/templates/schema";

export function CreateTemplateDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [isPending, startTransition] =
    useTransition();

  function submitAction(values: TemplateValues) {
    startTransition(async () => {
      await createTemplateAction(values);

      setOpen(false);

      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          + Create Template
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Create Consent Template
          </DialogTitle>
        </DialogHeader>

        <TemplateForm
          onSubmitAction={submitAction}
        />

        {isPending && (
          <p className="text-sm text-gray-500">
            Saving...
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}