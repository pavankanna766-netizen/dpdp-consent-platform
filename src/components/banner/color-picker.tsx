"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({
  value,
  onChange,
}: Props) {
  return (
    <div>
      <label className="text-sm font-medium">
        Primary Color
      </label>

      <div className="mt-2 flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
        />

        <input
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="rounded-lg border p-2"
        />
      </div>
    </div>
  );
}