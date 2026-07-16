import { AlertCircle } from "lucide-react";

interface Props {
  message: string;
}

export function ErrorState({
  message,
}: Props) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center max-w-xl mx-auto my-6 shadow-sm">
      <div className="flex flex-col items-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h3 className="mt-4 text-lg font-semibold text-red-800">
          Compliance Scan Error
        </h3>
        <p className="mt-2 text-sm text-red-700">
          {message}
        </p>
      </div>
    </div>
  );
}