"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function AuditSearch({
  value,
  onChange,
}: Props) {
  return (
    <input
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
      placeholder="Search audit events..."
      className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
    />
  );
}