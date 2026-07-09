export type ExportFormat =
  | "csv"
  | "json"
  | "pdf"
  | "xlsx";

export interface ExportOptions {
  filename: string;
}

export interface ExportResult {
  filename: string;
  contentType: string;
  buffer: Buffer;
}

export interface ExportProvider {
  readonly id: ExportFormat;

readonly name: string;

readonly extension: string;

readonly contentType: string;

  export<T>(
    rows: T[],
    options: ExportOptions
  ): Promise<ExportResult>;
}