"use client";

type CategoryToggleProps = {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (
    checked: boolean
  ) => void;
};

export function CategoryToggle({
  title,
  description,
  checked,
  disabled,
  onChange,
}: CategoryToggleProps) {
  return (
    <div className="flex items-start justify-between rounded-lg border p-4">
      <div className="pr-4">
        <h3 className="font-medium">
          {title}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) =>
          onChange?.(e.target.checked)
        }
        className="mt-1 h-5 w-5"
      />
    </div>
  );
}