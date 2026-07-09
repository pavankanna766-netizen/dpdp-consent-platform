import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { EventBadge } from "@/components/audit/event-badge";

import { getAuditLog } from "@/services/audit.service";

import { JsonViewer } from "@/components/json/json-viewer";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AuditEventPage({
  params,
}: Props) {
  const { id } = await params;

  let log;

  try {
    log = await getAuditLog(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Event"
        description="Detailed audit event information."
      />

      <div className="rounded-xl border bg-white p-8 space-y-6">

        <div>
          <h2 className="text-sm text-gray-500">
            Event
          </h2>

          <EventBadge
            event={log.event_type}
          />
        </div>

        <div>
          <h2 className="text-sm text-gray-500">
            Timestamp
          </h2>

          <p>
            {new Date(
              log.created_at
            ).toLocaleString()}
          </p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500">
            Entity
          </h2>

          <p>{log.entity_type}</p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500">
            Actor
          </h2>

          <p>{log.actor}</p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500">
            Entity ID
          </h2>

          <p className="font-mono break-all">
            {log.entity_id}
          </p>
        </div>

        <div>
  <h2 className="mb-3 text-sm text-gray-500">
    Payload
  </h2>

  <JsonViewer
    value={log.payload}
  />
</div>

      </div>
    </div>
  );
}