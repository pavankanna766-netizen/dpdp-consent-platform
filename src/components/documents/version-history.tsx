interface Props {
  versions: {
    id: string;

    version: number;

    status: string;

    updated_at: string;
  }[];
}

export function VersionHistory({
  versions,
}: Props) {
  return (
    <div className="rounded-xl border p-6">
      <h3 className="font-semibold">
        Version History
      </h3>

      <div className="mt-4 space-y-3">
        {versions.map((v) => (
          <div
            key={v.id}
            className="flex justify-between rounded border p-3"
          >
            <div>
              Version {v.version}
            </div>

            <div>
              {v.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}