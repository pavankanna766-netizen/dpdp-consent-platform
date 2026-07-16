interface Props {
  banner: {
    id: string;
    name: string;
    status: string;
    version: number;
  };
}

export function BannerCard({
  banner,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          {banner.name}
        </h3>

        <span className="rounded-full border px-2 py-1 text-xs">
          {banner.status}
        </span>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        Version {banner.version}
      </p>

      <a
        href={`/dashboard/banner/${banner.id}`}
        className="mt-4 inline-block rounded-lg border px-3 py-2 text-sm"
      >
        Edit Banner
      </a>
    </div>
  );
}