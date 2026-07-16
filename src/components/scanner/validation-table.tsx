interface ValidationWebsite {
  name: string;
  url: string;
}

interface Props {
  websites: ValidationWebsite[];
}

export function ValidationTable({
  websites,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Validation Lab
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="pb-3 pr-4">Website</th>
              <th className="pb-3 px-4">URL</th>
              <th className="pb-3 pl-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {websites.map((site) => (
              <tr key={site.url} className="hover:bg-gray-50/50">
                <td className="py-4 pr-4 font-medium text-gray-900">
                  {site.name}
                </td>
                <td className="py-4 px-4 text-gray-505 font-mono text-xs">
                  {site.url}
                </td>
                <td className="py-4 pl-4">
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600 ring-1 ring-inset ring-gray-500/10">
                    Pending
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}