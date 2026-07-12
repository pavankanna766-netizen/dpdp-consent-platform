import {
  ScanForm,
} from ".";

export function ScannerHeader() {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold">
          Privacy Scanner
        </h1>

        <p className="mt-2 text-muted-foreground">
          Scan your website for
          DPDP compliance,
          trackers and cookies.
        </p>
      </div>

      <ScanForm />
    </>
  );
}