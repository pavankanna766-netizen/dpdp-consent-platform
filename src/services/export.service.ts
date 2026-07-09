import { exportEngine } from "@/platform/export";

import {
  ExportFormat,
  ExportOptions,
  ExportResult,
} from "@/platform/export";

export async function exportData<T>(
  format: ExportFormat,
  rows: T[],
  options: ExportOptions
): Promise<ExportResult> {
  const provider =
    exportEngine.registry.get(format);

  return provider.export(
    rows,
    options
  );
}