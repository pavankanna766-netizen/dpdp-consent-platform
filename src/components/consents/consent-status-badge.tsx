type Props = {
  status: string;
};

export function ConsentStatusBadge({
  status,
}: Props) {
  const styles =
    status === "granted"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles}`}
    >
      {status}
    </span>
  );
}