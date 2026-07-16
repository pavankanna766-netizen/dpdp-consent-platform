"use client";

interface Props {
  companySlug: string;
}

export function CopyPolicyLink({
  companySlug,
}: Props) {
  async function copy() {
    await navigator.clipboard.writeText(
      `${window.location.origin}/p/${companySlug}/privacy`
    );
  }

  return (
    <button
      onClick={copy}
      className="rounded-lg border px-4 py-2"
    >
      Copy Link
    </button>
  );
}