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

import { updateTemplateAction } from "@/app/(app)/templates/actions";

import type { TemplateValues } from "@/app/(app)/templates/schema";

type Props = {
  template: {
    id: string;
    title: string;
    description: string | null;
    purpose: string;
    retention_period: string;
    legal_basis: string;
    consent_text: string;
    is_required: boolean;
  };
};

export function EditTemplateDialog({
  template,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [isPending, startTransition] =
    useTransition();

  function submitAction(values: TemplateValues) {
    startTransition(async () => {
      await updateTemplateAction(
        template.id,
        values
      );

      setOpen(false);

      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
        >
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Edit Template
          </DialogTitle>
        </DialogHeader>

        <TemplateForm
          initialValues={{
            title: template.title,
            description:
              template.description ?? "",
            purpose: template.purpose,
            retention_period:
              template.retention_period,
            legal_basis:
              template.legal_basis,
            consent_text:
              template.consent_text,
            is_required:
              template.is_required,
          }}
          submitLabel="Save Changes"
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