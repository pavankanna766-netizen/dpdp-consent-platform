import {
  StatCard,
} from ".";

interface Props {
  title: string;

  value: string | number;
}

export function SummaryCard({
  title,
  value,
}: Props) {
  return (
    <StatCard
      title={title}
      value={value}
    />
  );
}