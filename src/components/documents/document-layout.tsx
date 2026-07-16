interface Props {
  header: React.ReactNode;

  preview: React.ReactNode;

  sidebar: React.ReactNode;
}

export function DocumentLayout({
  header,
  preview,
  sidebar,
}: Props) {
  return (
    <main className="space-y-6 p-8">
      {header}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          {preview}
        </div>

        <div className="col-span-4">
          {sidebar}
        </div>
      </div>
    </main>
  );
}