"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  templateSchema,
  type TemplateValues,
} from "@/app/(app)/templates/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onSubmitAction: (values: TemplateValues) => void;
  initialValues?: TemplateValues;
  submitLabel?: string;
};

export function TemplateForm({
  onSubmitAction,
  initialValues,
  submitLabel = "Create Template",
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TemplateValues>({
    resolver: zodResolver(templateSchema),

    defaultValues:
  initialValues ?? {
    title: "",
    description: "",
    purpose: "",
    retention_period: "",
    legal_basis: "",
    consent_text: "",
    is_required: false,
  },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmitAction)}
      className="space-y-6"
    >
      {/* Template Title */}

      <div>
        <Label htmlFor="title">
          Template Title
        </Label>

        <Input
          id="title"
          {...register("title")}
        />

        {errors.title && (
          <p className="mt-1 text-sm text-red-500">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Description */}

      <div>
        <Label htmlFor="description">
          Description
        </Label>

        <Input
          id="description"
          {...register("description")}
        />
      </div>

      {/* Purpose */}

      <div>
        <Label htmlFor="purpose">
          Purpose
        </Label>

        <Input
          id="purpose"
          {...register("purpose")}
        />

        {errors.purpose && (
          <p className="mt-1 text-sm text-red-500">
            {errors.purpose.message}
          </p>
        )}
      </div>

      {/* Retention Period */}

      <div>
        <Label htmlFor="retention_period">
          Retention Period
        </Label>

        <Input
          id="retention_period"
          {...register("retention_period")}
        />

        {errors.retention_period && (
          <p className="mt-1 text-sm text-red-500">
            {errors.retention_period.message}
          </p>
        )}
      </div>

      {/* Legal Basis */}

      <div>
        <Label htmlFor="legal_basis">
          Legal Basis
        </Label>

        <Input
          id="legal_basis"
          {...register("legal_basis")}
        />

        {errors.legal_basis && (
          <p className="mt-1 text-sm text-red-500">
            {errors.legal_basis.message}
          </p>
        )}
      </div>

      {/* Consent Text */}

      <div>
        <Label htmlFor="consent_text">
          Consent Text
        </Label>

        <textarea
          id="consent_text"
          rows={6}
          {...register("consent_text")}
          className="w-full rounded-md border border-input px-3 py-2"
        />

        {errors.consent_text && (
          <p className="mt-1 text-sm text-red-500">
            {errors.consent_text.message}
          </p>
        )}
      </div>

      {/* Required Consent */}

      <div className="flex items-center gap-3">
        <input
          id="is_required"
          type="checkbox"
          {...register("is_required")}
        />

        <Label htmlFor="is_required">
          This consent is mandatory
        </Label>
      </div>

      <Button
  type="submit"
  className="w-full"
>
  {submitLabel}
</Button>
    </form>
  );
}