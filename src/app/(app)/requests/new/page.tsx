import { PageHeader } from "@/components/dashboard/page-header";
import { RequestForm } from "@/components/requests/request-form";

export default function NewRequestPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New DSAR Request"
        description="Create a new privacy request."
      />

      <div className="rounded-xl border bg-white p-8">
        <RequestForm />
      </div>
    </div>
  );
}