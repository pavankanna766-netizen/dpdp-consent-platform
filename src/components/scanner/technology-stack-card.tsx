interface Props {
  technologies: {
    title: string;

    items: string[];
  }[];
}

export function TechnologyStackCard({
  technologies,
}: Props) {
  if (
    technologies.length === 0
  ) {
    return null;
  }

  return (
    <div className="rounded-xl border p-6">

      <h2 className="text-lg font-semibold">

        Privacy Technology Stack

      </h2>

      <div className="mt-6 space-y-5">

        {technologies.map(
          (group) => (
            <div
              key={
                group.title
              }
            >
              <div className="mb-2 text-sm font-semibold capitalize text-muted-foreground">

                {group.title.replaceAll(
                  "-",
                  " "
                )}

              </div>

              <div className="flex flex-wrap gap-2">

                {group.items.map(
                  (
                    provider
                  ) => (
                    <span
                      key={
                        provider
                      }
                      className="rounded-full border bg-gray-50 px-3 py-1 text-sm"
                    >
                      {provider}
                    </span>
                  )
                )}

              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
}