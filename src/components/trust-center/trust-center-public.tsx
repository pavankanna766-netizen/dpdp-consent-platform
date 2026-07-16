import type { TrustCenterDashboard } from "@/modules/trust-center/domain/trust-center-dashboard";

interface Props {
  company: { company_name: string };
  dashboard: TrustCenterDashboard;
}

export function TrustCenterPublic({
  company,
  dashboard,
}: Props) {
  return (
    <main className="mx-auto max-w-5xl space-y-8 p-10">

      <div>

        <h1 className="text-5xl font-bold">
          {company.company_name}
        </h1>

        <p className="mt-3 text-xl text-muted-foreground">
          Trusted Privacy &
          Compliance
        </p>

      </div>

      <div className="grid grid-cols-3 gap-6">

        <div className="rounded-xl border p-6">

          <div className="text-sm">
            Privacy Score
          </div>

          <div className="mt-3 text-4xl font-bold">
            {dashboard.latestSummary?.dashboard.score ??
              "--"}
          </div>

        </div>

        <div className="rounded-xl border p-6">

          Privacy Policy

          <div className="mt-2">
            {dashboard.privacy
              ? "✅ Published"
              : "❌ Missing"}
          </div>

        </div>

        <div className="rounded-xl border p-6">

          Cookie Policy

          <div className="mt-2">
            {dashboard.cookies
              ? "✅ Published"
              : "❌ Missing"}
          </div>

        </div>

      </div>

    </main>
  );
}
