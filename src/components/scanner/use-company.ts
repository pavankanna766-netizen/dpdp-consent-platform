"use client";

import { useQuery } from "@tanstack/react-query";

export interface Company {
  id: string;
  company_name: string;
  website: string | null;
}

export function useCompany() {
  return useQuery<Company>({
    queryKey: ["company"],

    queryFn: async () => {
      const response =
        await fetch("/api/company/current");

      if (!response.ok) {
        throw new Error(
          "Failed to load company."
        );
      }

      return response.json();
    },
  });
}