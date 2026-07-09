import { SearchForm } from "./search-form";
import { EventFilter } from "./event-filter";

import { DateFilter } from "./date-filter";

type Props = {
  search: string;
  eventType?: string;
  from?: string;
  to?: string;
};

export function AuditToolbar({
  search,
  eventType,
  from,
  to,
}: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm md:flex-row md:items-center">
      <div className="flex-1">
        <SearchForm
          defaultValue={search}
        />
      </div>

      <EventFilter
        value={eventType}
      />
      <DateFilter
  from={from}
  to={to}
/>
    </div>
  );
}