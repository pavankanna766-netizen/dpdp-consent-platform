interface TechnologyItem {
  provider: string;
  category: string;
}

interface TechnologyStack {
  title: string;
  items: string[];
}

export function mapTechnologyStack(
  detections: TechnologyItem[]
): TechnologyStack[] {
  const groups = new Map<
    string,
    Set<string>
  >();

  for (const detection of detections) {
    if (
      !groups.has(
        detection.category
      )
    ) {
      groups.set(
        detection.category,
        new Set()
      );
    }

    groups
      .get(
        detection.category
      )!
      .add(
        detection.provider
      );
  }

  return [...groups.entries()].map(
    ([title, providers]) => ({
      title,

      items: [
        ...providers,
      ].sort(),
    })
  );
}