type Props = {
  status: string;
};

export function RequestStatusBadge({
  status,
}: Props) {
  if (status === "completed") {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
        Completed
      </span>
    );
  }

  return (
    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
      Pending
    </span>
  );
}