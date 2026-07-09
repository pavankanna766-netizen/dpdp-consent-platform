"use client";

import { useState } from "react";

import type {
  CompanyValues,
  OrganizationValues,
} from "@/app/onboarding/schema";

import { CompanyInfoStep } from "./company-info-step";
import { OrganizationStep } from "./organization-step";
import { UseCasesStep } from "./use-cases-step";
import { Progress } from "./progress";

export function OnboardingWizard() {
  const [step, setStep] = useState(1);

  const [companyData, setCompanyData] =
    useState<CompanyValues | null>(null);

  const [organizationData, setOrganizationData] =
    useState<OrganizationValues | null>(null);

  function next() {
    setStep((s) => Math.min(s + 1, 3));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1));
  }

  return (
    <div className="space-y-8">
      <Progress currentStep={step} />

      {step === 1 && (
        <CompanyInfoStep
          onNext={(values) => {
            setCompanyData(values);
            next();
          }}
        />
      )}

      {step === 2 && (
        <OrganizationStep
          onBack={back}
          onNext={(values) => {
            setOrganizationData(values);
            next();
          }}
        />
      )}

      {step === 3 && (
        <UseCasesStep
          onBack={back}
          companyData={companyData!}
          organizationData={organizationData!}
        />
      )}
    </div>
  );
}