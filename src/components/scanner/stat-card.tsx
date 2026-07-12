interface Props {
  title: string;

  value: string | number;

  subtitle?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">

      <div className="text-sm text-gray-500">
        {title}
      </div>

      <div className="mt-2 text-3xl font-bold">
        {value}
      </div>

      {subtitle && (
        <div className="mt-2 text-sm text-gray-500">
          {subtitle}
        </div>
      )}

    </div>
  );
}