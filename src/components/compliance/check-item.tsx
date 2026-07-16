import type {
  ComplianceStatus,
} from "@/modules/compliance";

interface Props {
  item: ComplianceStatus;
}

export function CheckItem({
  item,
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <span className="capitalize">
        {item.module.replaceAll(
          "-",
          " "
        )}
      </span>

      <span
        className={
          item.completed
            ? "text-green-600 font-medium"
            : "text-gray-500"
        }
      >
        {item.completed
          ? "Completed"
          : "Pending"}
      </span>
    </div>
  );
}