import ExcelJS from "exceljs";

import { BaseExportProvider } from "../base-provider";
import {
  ExportOptions,
  ExportResult,
} from "../types";

export class XlsxProvider
  extends BaseExportProvider
{
  readonly id = "xlsx";

  readonly name = "Excel";

  readonly extension = "xlsx";

  readonly contentType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  async export<T>(
    rows: T[],
    options: ExportOptions
  ): Promise<ExportResult> {

    const workbook =
      new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet("Export");

    if (rows.length > 0) {
      const headers =
        Object.keys(rows[0] as object);

      worksheet.addRow(headers);

      rows.forEach((row) => {
        worksheet.addRow(
          headers.map(
            (header) =>
              (row as Record<
                string,
                unknown
              >)[header]
          )
        );
      });
    }

    const buffer =
      await workbook.xlsx.writeBuffer();

    return this.createResult(
  Buffer.from(buffer),
  options
    );
  }
}

export const xlsxProvider =
  new XlsxProvider();