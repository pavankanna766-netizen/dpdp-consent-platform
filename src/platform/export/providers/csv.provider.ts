import { BaseExportProvider } from "../base-provider";

import {
  ExportOptions,
  ExportResult,
} from "../types";

export class CsvProvider
  extends BaseExportProvider
{
  readonly id = "csv";

  readonly name = "CSV";

  readonly extension = "csv";

  readonly contentType =
    "text/csv";

  async export<T>(
    rows: T[],
    options: ExportOptions
  ): Promise<ExportResult> {

    if (rows.length === 0) {
  return this.createEmptyResult(
    options
  );
}

    const headers =
      Object.keys(rows[0] as object);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) =>
            `"${String(
              (row as Record<
                string,
                unknown
              >)[header] ?? ""
            ).replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ].join("\n");

    return this.createResult(
  csv,
  options
);
  }
}

export const csvProvider =
  new CsvProvider();