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

const PRESETS = [
  {
    name: "Default Cookie Notice (English)",
    values: {
      title: "Default Cookie Notice (English)",
      description: "Standard DPDP compliant English cookie consent template.",
      purpose: "Website Analytics & Personalization",
      legal_basis: "Consent",
      retention_period: "Until withdrawn",
      consent_text: "We use cookies to analyze web traffic, personalize content, and display relevant advertisements. By clicking Accept, you consent to our use of cookies in accordance with our Privacy Policy. You can withdraw your consent at any time.",
      is_required: false,
    }
  },
  {
    name: "Default Cookie Notice (Hindi)",
    values: {
      title: "Default Cookie Notice (Hindi)",
      description: "Standard DPDP compliant Hindi cookie consent template.",
      purpose: "वेबसाइट विश्लेषण और वैयक्तिकरण (Website Analytics)",
      legal_basis: "सहमति (Consent)",
      retention_period: "वापस लेने तक (Until withdrawn)",
      consent_text: "हम अपने उपयोगकर्ताओं के अनुभव को बेहतर बनाने, ट्रैफ़िक का विश्लेषण करने और विज्ञापनों को अनुकूलित करने के लिए कुकीज़ का उपयोग करते हैं। 'स्वीकार करें' पर क्लिक करके, आप हमारी गोपनीयता नीति के अनुसार कुकीज़ के उपयोग के लिए सहमति देते हैं। आप किसी भी समय अपनी सहमति वापस ले सकते हैं।",
      is_required: false,
    }
  },
  {
    name: "Minors Parental Consent (Section 9)",
    values: {
      title: "Parental Consent for Minors (English)",
      description: "DPDP Section 9 compliant child data processing consent template.",
      purpose: "Educational/Child Oriented Services",
      legal_basis: "Verifiable Parental Consent",
      retention_period: "Until account deletion",
      consent_text: "As the parent or legal guardian of the child, I hereby grant verifiable consent for PrivyStack to process my child's personal data (such as name, age, and grade details) to deliver services in accordance with Section 9 of the DPDP Act 2023. I understand that I can withdraw this consent or inspect the processed data at any time.",
      is_required: true,
    }
  },
  {
    name: "Marketing and Promotions (English)",
    values: {
      title: "Marketing Outreach (English)",
      description: "Consent for promotional messages and emails.",
      purpose: "Marketing and Promotions",
      legal_basis: "Consent",
      retention_period: "2 Years",
      consent_text: "I consent to receive promotional emails, SMS notifications, and WhatsApp updates from PrivyStack regarding new features, offers, and compliance guidelines. I understand my contact info will not be shared with third parties and I can opt out instantly.",
      is_required: false,
    }
  }
];

export function TemplateForm({
  onSubmitAction,
  initialValues,
  submitLabel = "Create Template",
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
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
      {/* Preset Selector */}
      <div className="rounded-lg border border-indigo-100 bg-indigo-50/30 p-4">
        <Label htmlFor="preset-select" className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">
          💡 Populate from DPDP Compliance Preset
        </Label>
        <select
          id="preset-select"
          onChange={(e) => {
            const preset = PRESETS.find(p => p.name === e.target.value);
            if (preset) {
              Object.entries(preset.values).forEach(([key, val]) => {
                setValue(key as keyof TemplateValues, val);
              });
            }
          }}
          className="mt-2 block w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          defaultValue=""
        >
          <option value="" disabled>Select a bilingual or Section 9 preset...</option>
          {PRESETS.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

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