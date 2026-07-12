import {
  ScannerDashboard,
  ScannerHeader,
  ScannerProvider,
  ScanHistory,
} from "@/components/scanner";

export default function ScannerPage() {
  return (
    <main className="p-8">
      <ScannerProvider>
        <div className="grid grid-cols-12 gap-6">

  <div className="col-span-3">

    <ScannerHeader />

    <ScanHistory />

  </div>

  <div className="col-span-9">

    <ScannerDashboard />

  </div>

</div>
      </ScannerProvider>
    </main>
  );
}