import {
  createConsentReceipt,
  type ConsentRecord,
} from "@/platform/contracts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  consent: ConsentRecord;
};

const categoryLabels = {
  analytics: "Analytics",
  marketing: "Marketing",
  preferences: "Preferences",
} as const;

export function ConsentReceiptCard({ consent }: Props) {
  const receipt = createConsentReceipt(consent);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consent receipt</CardTitle>
        <p className="text-sm text-muted-foreground">
          Immutable evidence captured when this consent was recorded.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <ReceiptValue label="Receipt ID" value={receipt.receiptId} />
        <ReceiptValue
          label="Recorded"
          value={new Date(receipt.recordedAt).toLocaleString()}
        />
        <ReceiptValue label="Version" value={`v${receipt.version}`} />
        <ReceiptValue
          label="Language"
          value={consent.language ?? "Not recorded"}
        />
        {receipt.categories && (
          <div className="sm:col-span-2">
            <p className="text-sm font-medium">Purpose choices</p>
            <ul className="mt-2 flex flex-wrap gap-2" aria-label="Purpose choices">
              {Object.entries(receipt.categories).map(([category, accepted]) => (
                <li
                  key={category}
                  className={accepted
                    ? "rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-800"
                    : "rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"}
                >
                  {categoryLabels[category as keyof typeof categoryLabels]}: {accepted ? "Allowed" : "Declined"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReceiptValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 break-all font-medium">{value}</p>
    </div>
  );
}
