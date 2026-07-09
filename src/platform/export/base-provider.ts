import {
  ExportOptions,
  ExportProvider,
  ExportResult,
  ExportFormat,
} from "./types";

export abstract class BaseExportProvider
  implements ExportProvider
{
  abstract readonly id: ExportFormat;

  abstract readonly name: string;

  abstract readonly extension: string;

  abstract readonly contentType: string;

  protected createResult(
  content: string | Buffer,
  options: ExportOptions
): ExportResult {
  return {
    filename: `${options.filename}.${this.extension}`,
    contentType: this.contentType,
    buffer:
      typeof content === "string"
        ? Buffer.from(content)
        : content,
  };
}

  protected createEmptyResult(
    options: ExportOptions
  ): ExportResult {
    return this.createResult(
      "",
      options
    );
  }

  abstract export<T>(
    rows: T[],
    options: ExportOptions
  ): Promise<ExportResult>;
}