"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  from?: string;
  to?: string;
};

export function DateFilter({
  from,
  to,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function update(
    key: "from" | "to",
    value: string
  ) {
    const url =
      new URLSearchParams(params);

    if (value) {
      url.set(key, value);
    } else {
      url.delete(key);
    }

    router.push(
      `/audit?${url.toString()}`
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="date"
        value={from ?? ""}
        onChange={(e) =>
          update(
            "from",
            e.target.value
          )
        }
        className="rounded-lg border px-3 py-2"
      />

      <input
        type="date"
        value={to ?? ""}
        onChange={(e) =>
          update(
            "to",
            e.target.value
          )
        }
        className="rounded-lg border px-3 py-2"
      />
    </div>
  );
}