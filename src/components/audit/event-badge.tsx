type Props = {
  event: string;
};

export function EventBadge({
  event,
}: Props) {
  const styles: Record<string, string> = {
    "request.created":
      "bg-blue-100 text-blue-700",

    "request.completed":
      "bg-green-100 text-green-700",

    "consent.accepted":
      "bg-emerald-100 text-emerald-700",

    "consent.withdrawn":
      "bg-red-100 text-red-700",

    "template.created":
      "bg-purple-100 text-purple-700",

    "template.published":
      "bg-orange-100 text-orange-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[event] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {event}
    </span>
  );
}