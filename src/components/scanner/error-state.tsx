interface Props {
  message: string;
}

export function ErrorState({
  message,
}: Props) {
  return (
    <div className="rounded-xl border border-red-500 p-10">
      {message}
    </div>
  );
}