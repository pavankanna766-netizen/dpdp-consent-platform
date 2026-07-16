interface Props {
  trackers: {
    id: string;
    provider: string;
    category: string;
  }[];
}

export function TrackerTable({
  trackers,
}: Props) {
  if (trackers.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">Detected Trackers</h2>
        <p className="mt-4 text-sm text-gray-500 text-center">No trackers detected during scan.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-gray-900">Detected Trackers</h2>

      <div className="mt-4 divide-y divide-gray-100">
        {trackers.map((tracker) => (
          <div
            key={tracker.id}
            className="flex items-center justify-between py-3 text-sm"
          >
            <span className="font-medium text-gray-900">
              {tracker.provider}
            </span>

            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 uppercase">
              {tracker.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}