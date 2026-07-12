"use client";

interface Props {
  status:
    | "idle"
    | "running"
    | "completed"
    | "failed";
}

export function ScanProgress({
  status,
}: Props) {
  return (
    <div className="rounded-xl border p-5">
      <div className="font-semibold">
        Scan Status
      </div>

      <div className="mt-3">
        {status === "idle" &&
          "Ready"}

        {status === "running" &&
          "Scanning..."}

        {status ===
          "completed" &&
          "Completed"}

        {status ===
          "failed" &&
          "Failed"}
      </div>
    </div>
  );
}