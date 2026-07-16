interface Props {
  html: string;
}

export function DocumentPreview({
  html,
}: Props) {
  return (
    <div
      className="prose max-w-none rounded-xl border bg-white p-8"
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  );
}