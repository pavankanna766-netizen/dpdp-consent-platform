"use client";

import { useState } from "react";

import { createRequestAction } from "@/app/(app)/requests/actions";

export function RequestForm() {

  const [loading, setLoading] =
    useState(false);

  const [subject, setSubject] =
    useState("");

  const [type, setType] =
    useState("access");

  const [description, setDescription] =
    useState("");

  async function onSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      await createRequestAction({
  subject_identifier: subject,
  request_type: type as
    | "access"
    | "delete"
    | "correction",
  description: description || null,
});
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium">
          Subject Identifier
        </label>

        <input
          className="mt-2 w-full rounded-lg border p-3"
          value={subject}
          onChange={(e) =>
            setSubject(e.target.value)
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Request Type
        </label>

        <select
          className="mt-2 w-full rounded-lg border p-3"
          value={type}
          onChange={(e) =>
            setType(e.target.value)
          }
        >
          <option value="access">
            Access
          </option>

          <option value="delete">
            Delete
          </option>

          <option value="correction">
            Correction
          </option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Description
        </label>

        <textarea
          className="mt-2 w-full rounded-lg border p-3"
          rows={5}
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
        />
      </div>

      <button
        disabled={loading}
        className="rounded-lg bg-black px-6 py-3 text-white"
      >
        {loading
          ? "Creating..."
          : "Create Request"}
      </button>
    </form>
  );
}