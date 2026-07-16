import type {
  ComplianceStatus,
} from "@/modules/compliance";

import {
  ProgressBar,
} from "./progress-bar";

import {
  CheckItem,
} from "./check-item";

interface Props {
  progress: number;

  items: ComplianceStatus[];
}

export function ComplianceCard({
  progress,
  items,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">
        DPDP Compliance
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Complete these steps to
        become compliant.
      </p>

      <div className="mt-6">
        <ProgressBar
          value={progress}
        />
      </div>

      <div className="mt-2 text-sm font-medium">
        {progress}% Complete
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <CheckItem
            key={item.module}
            item={item}
          />
        ))}
      </div>
    </div>
  );
}