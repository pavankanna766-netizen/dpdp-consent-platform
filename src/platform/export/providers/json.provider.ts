import { BaseExportProvider } from "../base-provider";

import {
  ExportOptions,
  ExportResult,
} from "../types";

export class JsonProvider
  extends BaseExportProvider
{
  readonly id = "json";

  readonly name = "JSON";

  readonly extension = "json";

  readonly contentType =
    "application/json";

  async export<T>(
    rows: T[],
    options: ExportOptions
  ): Promise<ExportResult> {

    if (rows.length === 0) {
      return this.createEmptyResult(
        options
      );
    }

    const json = JSON.stringify(
      rows,
      null,
      2
    );

    return this.createResult(
      json,
      options
    );
  }
}

export const jsonProvider =
  new JsonProvider();