"use client";

import { useState } from "react";

export function CreateBannerDialog() {
  const [name, setName] =
    useState("");

  async function createBanner() {
    if (!name.trim()) {
      return;
    }

    const response =
      await fetch(
        "/api/banner",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
          }),
        }
      );

    if (response.ok) {
      window.location.reload();
    }
  }

  return (
    <div className="rounded-xl border p-5">
      <h2 className="text-lg font-semibold">
        Create Cookie Banner
      </h2>

      <input
        className="mt-4 w-full rounded-lg border p-2"
        placeholder="Banner Name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
      />

      <button
        onClick={createBanner}
        className="mt-4 rounded-lg bg-black px-4 py-2 text-white"
      >
        Create Banner
      </button>
    </div>
  );
}