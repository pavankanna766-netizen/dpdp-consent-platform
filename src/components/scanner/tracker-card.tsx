interface Evidence {
  type: string;
  value: string;
}

interface TrackerCardProps {
  provider: string;

  category: string;

  confidence: number;

  evidence: Evidence[];

  requiresConsent: boolean;
}

export function TrackerCard({
  provider,
  category,
  confidence,
  evidence,
  requiresConsent,
}: TrackerCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <h3 className="text-lg font-semibold">
            {provider}
          </h3>

          <p className="text-sm text-gray-500 capitalize">
            {category}
          </p>

        </div>

        <div className="text-right">

          <div className="text-2xl font-bold">
            {confidence}%
          </div>

          <div className="text-xs text-gray-500">
            Confidence
          </div>

        </div>

      </div>

      <div className="mt-6">

        <div className="mb-2 font-medium">
          Evidence
        </div>

        <div className="space-y-2">

          {evidence.map(
            (item, index) => (
              <div
                key={index}
                className="rounded-lg bg-gray-50 p-3 text-sm"
              >
                <span className="font-medium capitalize">
                  {item.type}
                </span>

                {" • "}

                {item.value}
              </div>
            )
          )}

        </div>

      </div>

      <div className="mt-6">

        <span
          className={`rounded-full px-3 py-1 text-sm ${
            requiresConsent
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {requiresConsent
            ? "Consent Required"
            : "No Consent Required"}
        </span>

      </div>

    </div>
  );
}