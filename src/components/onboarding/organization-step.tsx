"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  organizationSchema,
  type OrganizationValues,
} from "@/app/onboarding/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onNext: (values: OrganizationValues) => void;
  onBack: () => void;
};

export function OrganizationStep({
  onNext,
  onBack,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationValues>({
    resolver: zodResolver(organizationSchema),

    defaultValues: {
      country: "",
      timezone: "",
    },
  });

function onSubmit(values: OrganizationValues) {
  onNext(values);
}

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div>
        <Label htmlFor="country">
          Country
        </Label>

        <Input
          id="country"
          placeholder="India"
          {...register("country")}
        />

        {errors.country && (
          <p className="mt-1 text-sm text-red-500">
            {errors.country.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="timezone">
          Timezone
        </Label>

        <Input
          id="timezone"
          placeholder="Asia/Kolkata"
          {...register("timezone")}
        />

        {errors.timezone && (
          <p className="mt-1 text-sm text-red-500">
            {errors.timezone.message}
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>

        <Button type="submit">
          Continue
        </Button>
      </div>
    </form>
  );
}