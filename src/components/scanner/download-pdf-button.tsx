"use client";

interface Props {
  scanId: string;
}

export function DownloadPdfButton({
  scanId,
}: Props) {
  function download() {
    window.open(
      `/api/scanner/${scanId}/pdf`,
      "_blank"
    );
  }

  return (
    <button
      onClick={download}
      className="rounded-lg border px-4 py-2"
    >
      Download PDF
    </button>
  );
}