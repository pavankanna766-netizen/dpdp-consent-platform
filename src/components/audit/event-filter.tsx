"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  value?: string;
};

const events = [
  "",
  "request.created",
  "request.completed",
  "template.created",
  "template.published",
  "consent.accepted",
  "consent.withdrawn",
];

export function EventFilter({
  value,
}: Props) {
  const router = useRouter();

  const params = useSearchParams();

  return (
    <select
      value={value ?? ""}
      onChange={(e) => {
        const search =
          params.get("search");

        const url =
          new URLSearchParams();

        if (search) {
          url.set(
            "search",
            search
          );
        }

        if (e.target.value) {
          url.set(
            "eventType",
            e.target.value
          );
        }

        router.push(
          `/audit?${url.toString()}`
        );
      }}
      className="rounded-lg border px-4 py-3"
    >
      <option value="">
        All Events
      </option>

      {events
        .filter(Boolean)
        .map((event) => (
          <option
            key={event}
            value={event}
          >
            {event}
          </option>
        ))}
    </select>
  );
}