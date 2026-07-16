import {
  BannerCard,
} from "./banner-card";

interface Props {
  banners: {
    id: string;
    name: string;
    status: string;
    version: number;
  }[];
}

export function BannerList({
  banners,
}: Props) {
  if (
    banners.length === 0
  ) {
    return (
      <div className="rounded-xl border p-8 text-center">
        No cookie banners yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {banners.map((banner) => (
        <BannerCard
          key={banner.id}
          banner={banner}
        />
      ))}
    </div>
  );
}