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
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-xl font-semibold">
        Validation Lab
      </h2>

      <table className="w-full">

        <thead>
          <tr className="border-b text-left">

            <th className="pb-3">
              Website
            </th>

            <th className="pb-3">
              URL
            </th>

            <th className="pb-3">
              Status
            </th>

          </tr>
        </thead>

        <tbody>

          {websites.map(
            (site) => (
              <tr
                key={site.url}
                className="border-b"
              >

                <td className="py-4">
                  {site.name}
                </td>

                <td className="py-4 text-gray-500">
                  {site.url}
                </td>

                <td className="py-4">

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">

                    Pending

                  </span>

                </td>

              </tr>
            )
          )}

        </tbody>

      </table>

    </div>
  );
}