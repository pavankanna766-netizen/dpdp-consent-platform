"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  page: number;
  hasNext: boolean;
};

export function Pagination({
  page,
  hasNext,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function go(nextPage: number) {

  const url = new URLSearchParams(params);

  if (nextPage <= 1) {
    url.delete("page");
  } else {
    url.set("page", nextPage.toString());
  }

  router.push(`/audit?${url.toString()}`);
}
  return (
    <div className="mt-6 flex items-center justify-between">

      <button
        disabled={page === 1}
        onClick={() => go(page - 1)}
        className="rounded-lg border px-4 py-2 disabled:opacity-50"
      >
        ← Previous
      </button>

      <span className="text-sm text-gray-500">
        Page {page}
      </span>

      <button
        disabled={!hasNext}
        onClick={() => go(page + 1)}
        className="rounded-lg border px-4 py-2 disabled:opacity-50"
      >
        Next →
      </button>

    </div>
  );
}