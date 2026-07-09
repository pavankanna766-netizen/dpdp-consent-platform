type Props = {
  title: string;
  description: string;
};

export function ActivityItem({
  title,
  description,
}: Props) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <div className="mt-1 h-3 w-3 rounded-full bg-green-500" />

      <div>
        <h4 className="font-medium">
          {title}
        </h4>

        <p className="text-sm text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}