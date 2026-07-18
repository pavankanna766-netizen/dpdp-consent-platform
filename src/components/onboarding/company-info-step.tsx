"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  companySchema,
  type CompanyValues,
} from "@/app/onboarding/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onNext: (values: CompanyValues) => void;
};

export function CompanyInfoStep({
  onNext,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyValues>({
    resolver: zodResolver(companySchema),

    defaultValues: {
      company_name: "",
      industry: "",
      company_size: "",
      website: "",
    },
  });

  function onSubmit(values: CompanyValues) {
  onNext(values);
}

  return (
    <form
  onSubmit={handleSubmit(onSubmit)}
  className="space-y-6"
>
      {/* Company Name */}

      <div>
        <Label htmlFor="company_name">
          Company Name
        </Label>

        <Input
          id="company_name"
          {...register("company_name")}
          placeholder="Acme Inc."
        />

        {errors.company_name && (
          <p className="mt-1 text-sm text-red-500">
            {errors.company_name.message}
          </p>
        )}
      </div>

      {/* Industry */}

      <div>
        <Label htmlFor="industry">
          Industry
        </Label>

        <Input
          id="industry"
          {...register("industry")}
          placeholder="Healthcare"
        />

        {errors.industry && (
          <p className="mt-1 text-sm text-red-500">
            {errors.industry.message}
          </p>
        )}
      </div>

      {/* Company Size */}

      <div>
        <Label htmlFor="company_size">
          Company Size
        </Label>

        <Input
          id="company_size"
          {...register("company_size")}
          placeholder="11-50"
        />

        {errors.company_size && (
          <p className="mt-1 text-sm text-red-500">
            {errors.company_size.message}
          </p>
        )}
      </div>

      {/* Website */}

      <div>
        <Label htmlFor="website">
          Website
        </Label>

        <Input
          id="website"
          {...register("website")}
          placeholder="https://example.com"
        />

        {errors.website && (
          <p className="mt-1 text-sm text-red-500">
            {errors.website.message}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          Continue
        </Button>
      </div>
    </form>
  );
}