import {
  SeverityBadge,
} from ".";


interface Props {
  findings: {
    id: string;

    title: string;

    recommendation: string;

    severity?: string;

    evidence?: {
      cookie?: string;

      tracker?: string;

      domain?: string;

      secure?: boolean;

      httpOnly?: boolean;

      sameSite?: string;

      rule?: string;
    };
  }[];
}

export function FindingsTable({
  findings,
}: Props) {
  return (
  <div className="rounded-xl border p-5">
    <h2 className="font-semibold">
      Compliance Findings
    </h2>

    <div className="mt-4 space-y-4">
      {findings.map((finding) => (
        <div
          key={finding.id}
          className="rounded-lg border p-4"
        >
          <div className="flex items-center justify-between">
            <div className="font-medium">
              {finding.title}
            </div>

            {finding.severity && (
  <SeverityBadge
    severity={
      finding.severity as
        | "info"
        | "critical"
        | "high"
        | "medium"
        | "low"
    }
  />
)}
          </div>

          <div className="mt-2 text-sm text-muted-foreground">
            {finding.recommendation}
          </div>

          {finding.evidence && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm space-y-1">

              {finding.evidence.cookie && (
                <div>
                  <strong>Cookie:</strong>{" "}
                  {finding.evidence.cookie}
                </div>
              )}

              {finding.evidence.tracker && (
                <div>
                  <strong>Tracker:</strong>{" "}
                  {finding.evidence.tracker}
                </div>
              )}

              {finding.evidence.domain && (
                <div>
                  <strong>Domain:</strong>{" "}
                  {finding.evidence.domain}
                </div>
              )}

              {finding.evidence.secure !==
                undefined && (
                <div>
                  <strong>Secure:</strong>{" "}
                  {finding.evidence.secure
                    ? "Yes"
                    : "No"}
                </div>
              )}

              {finding.evidence.httpOnly !==
                undefined && (
                <div>
                  <strong>HttpOnly:</strong>{" "}
                  {finding.evidence.httpOnly
                    ? "Yes"
                    : "No"}
                </div>
              )}

              {finding.evidence.sameSite && (
                <div>
                  <strong>SameSite:</strong>{" "}
                  {finding.evidence.sameSite}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);
}
