interface Props {
  stage: string;

  progress: number;

  estimatedSeconds?: number;
}

export function ProgressCard({
  stage,
  progress,
  estimatedSeconds,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="flex justify-between">

        <div>

          <div className="text-sm text-muted-foreground">
            Live Scan Progress
          </div>

          <div className="mt-2 font-semibold capitalize">
            {stage.replaceAll(
              "-",
              " "
            )}
          </div>

        </div>

        <div className="text-xl font-bold">
          {progress}%
        </div>

      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-200">

        <div
          className="h-full bg-blue-600 transition-all duration-700"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      {estimatedSeconds !==
        undefined && (
        <div className="mt-3 text-sm text-muted-foreground">
          About{" "}
          {estimatedSeconds}
          s remaining
        </div>
      )}

    </div>
  );
}