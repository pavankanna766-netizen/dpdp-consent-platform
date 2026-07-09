"use client";

import { saveOnboarding } from "@/app/onboarding/actions";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import type {
  CompanyValues,
  OrganizationValues,
} from "@/app/onboarding/schema";

type Props = {
  onBack: () => void;
  companyData: CompanyValues;
  organizationData: OrganizationValues;
};

const options = [
  "Employee Data",
  "Customer Data",
  "Marketing",
  "Analytics",
  "Healthcare",
  "Finance",
  "AI Training",
  "Vendor Management",
];

export function UseCasesStep({
  onBack,
  companyData,
  organizationData,
}: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(value: string) {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  }

 async function finish() {
  await saveOnboarding({
    ...companyData,
    ...organizationData,
    useCases: selected,
  });
}

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">
          What will you use PrivyStack for?
        </h2>

        <p className="mt-2 text-gray-500">
          Select all that apply.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => {
          const active = selected.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`rounded-xl border p-4 text-left transition ${
                active
                  ? "border-black bg-black text-white"
                  : "border-gray-300 hover:border-gray-500"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>

        <Button
          onClick={finish}
          disabled={selected.length === 0}
        >
          Finish
        </Button>
      </div>
    </div>
  );
}