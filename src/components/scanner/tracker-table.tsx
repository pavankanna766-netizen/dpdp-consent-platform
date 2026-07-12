interface Props {
  trackers:{
  id: string;
  provider: string;
  category: string;
}[];
}

export function TrackerTable({
  trackers,
}: Props) {
  return (
    <div className="rounded-xl border p-5">
      <h2 className="font-semibold">
        Detected Trackers
      </h2>

      <div className="mt-4 space-y-2">
        {trackers.map(
          (tracker) => (
            <div
              key={tracker.id}
              className="flex justify-between"
            >
              <span>
                {tracker.provider}
              </span>

              <span>
                {tracker.category}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}