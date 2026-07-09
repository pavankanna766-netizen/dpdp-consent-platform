"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  defaultValue: string;
};

export function SearchForm({
  defaultValue,
}: Props) {
  const router = useRouter();

  const [value, setValue] =
    useState(defaultValue);

  function onSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const query =
      value.trim();

    if (!query) {
      router.push("/audit");
      return;
    }

    router.push(
      `/audit?search=${encodeURIComponent(
        query
      )}`
    );
  }

  return (
  <form
    onSubmit={onSubmit}
    className="mb-6 flex gap-3"
  >
    <input
      value={value}
      onChange={(e) =>
        setValue(e.target.value)
      }
      placeholder="Search event, actor or entity..."
      className="flex-1 rounded-lg border px-4 py-3"
    />

    <button
      type="submit"
      className="rounded-lg bg-black px-6 py-3 text-white"
    >
      Search
    </button>
  </form>
);
}