"use client";

export default function AppLoading() {
  return (
    <div className="flex h-[75vh] w-full flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing rings */}
        <div className="h-16 w-16 animate-ping rounded-full bg-indigo-500/25 absolute"></div>
        <div className="h-12 w-12 animate-pulse rounded-full bg-violet-500/40 absolute"></div>
        {/* Inner rotating ring */}
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-t-transparent shadow-md"></div>
      </div>
      <div className="flex flex-col items-center gap-1.5 mt-2">
        <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Loading details</h3>
        <p className="text-xs text-gray-500 font-medium">Please wait while we load your organization privacy records...</p>
      </div>
    </div>
  );
}
