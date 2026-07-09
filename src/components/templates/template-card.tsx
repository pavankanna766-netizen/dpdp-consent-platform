"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { EditTemplateDialog } from "./edit-template-dialog";
import { Button } from "@/components/ui/button";

import {
  deleteTemplateAction,
  publishTemplateAction,
} from "@/app/(app)/templates/actions";

type Props = {
  template: {
    id: string;
    title: string;
    description: string | null;
    purpose: string;
    legal_basis: string;
    retention_period: string;
    status: string;
    version: number;
    is_required: boolean;
    consent_text: string;
  };
};

export function TemplateCard({
  template,
}: Props) {
    const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  function deleteTemplate() {
    const confirmed = window.confirm(
      `Delete "${template.title}"?`
    );

    if (!confirmed) return;

    startTransition(async () => {
      await deleteTemplateAction(template.id);

      router.refresh();
    });
  }

  function publishTemplate() {
  startTransition(async () => {
    await publishTemplateAction(template.id);

    router.refresh();
  });
}
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {template.title}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Version {template.version}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            template.status === "published"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {template.status}
        </span>
      </div>

      {template.description && (
        <p className="mt-4 text-gray-600">
          {template.description}
        </p>
      )}

      <div className="mt-6 space-y-2 text-sm">
        <p>
          <strong>Purpose:</strong>{" "}
          {template.purpose}
        </p>

        <p>
          <strong>Legal Basis:</strong>{" "}
          {template.legal_basis}
        </p>

        <p>
          <strong>Retention:</strong>{" "}
          {template.retention_period}
        </p>

        <p>
          <strong>Required:</strong>{" "}
          {template.is_required ? "Yes" : "No"}
        </p>
      </div>

      <div className="mt-6 flex gap-3">
  <EditTemplateDialog
    template={{
      id: template.id,
      title: template.title,
      description: template.description,
      purpose: template.purpose,
      retention_period: template.retention_period,
      legal_basis: template.legal_basis,
      consent_text: template.consent_text,
      is_required: template.is_required,
    }}
  />

  <Button
    variant="outline"
    size="sm"
    onClick={deleteTemplate}
    disabled={isPending}
  >
    {isPending ? "Deleting..." : "Delete"}
  </Button>

  <Button
    size="sm"
    onClick={publishTemplate}
    disabled={
      isPending ||
      template.status === "published"
    }
  >
    {template.status === "published"
      ? "Published"
      : isPending
      ? "Publishing..."
      : "Publish"}
  </Button>
</div>
  </div>
  );
}