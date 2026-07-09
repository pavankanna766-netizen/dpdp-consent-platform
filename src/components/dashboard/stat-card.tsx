import { ReactNode } from "react";

type Props = {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
};

export function StatCard({
  title,
  value,
  description,
  icon,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">
          {title}
        </h3>

        {icon}
      </div>

      <p className="mt-4 text-4xl font-bold">
        {value}
      </p>

      {description && (
  <p className="mt-2 text-sm text-gray-500">
    {description}
  </p>
)}
    </div>
  );
}