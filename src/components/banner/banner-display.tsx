interface Props {
  position:
    | "top"
    | "bottom"
    | "floating";

  children: React.ReactNode;
}

export function BannerDisplay({
  position,
  children,
}: Props) {
  const positionClass =
    position === "top"
      ? "items-start"
      : position === "bottom"
      ? "items-end"
      : "items-center";

  return (
    <div
      className={`flex min-h-[420px] ${positionClass}`}
    >
      {children}
    </div>
  );
}