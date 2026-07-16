import Link from "next/link";

import type { ConsentRecord } from "@/platform/contracts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConsentStatusBadge } from "./consent-status-badge";

type Props = {
  history: ConsentRecord[];
  currentConsentId: string;
};

export function ConsentHistory({ history, currentConsentId }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consent history</CardTitle>
        <p className="text-sm text-muted-foreground">
          All records for this subject in the current organization.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3" aria-label="Consent history">
          {history.map((record) => (
            <li
              key={record.id}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">Version {record.version}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(record.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ConsentStatusBadge status={record.status} />
                {record.id !== currentConsentId && (
                  <Link
                    className="text-sm font-medium text-primary hover:underline"
                    href={`/consents/${record.id}`}
                  >
                    View receipt
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
