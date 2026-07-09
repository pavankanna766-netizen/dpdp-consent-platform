type ProgressProps = {
  currentStep: number;
};

const steps = [
  "Company",
  "Organization",
  "Use Cases",
];

export function Progress({
  currentStep,
}: ProgressProps) {
  return (
    <div className="flex justify-between">
      {steps.map((step, index) => {
        const active = currentStep === index + 1;

        return (
          <div
            key={step}
            className="flex flex-col items-center flex-1"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border font-semibold ${
                active
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              {index + 1}
            </div>

            <span className="mt-2 text-sm">
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}