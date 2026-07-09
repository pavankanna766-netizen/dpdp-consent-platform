import type { PlatformService } from "../platform-service";

import { exportRegistry } from "./registry";

import { csvProvider } from "./providers/csv.provider";

import { jsonProvider } from "./providers/json.provider";

import { xlsxProvider } from "./providers/xlsx.provider";

import { pdfProvider } from "./providers/pdf.provider";

export class ExportEngine
  implements PlatformService
{
  readonly name = "export-engine";

  initialize() {
  console.log(
    "📦 ExportEngine initialized"
  );

  this.registry.register(
  csvProvider
);

this.registry.register(
  jsonProvider
);

this.registry.register(
  xlsxProvider
);

this.registry.register(
  pdfProvider);

}

  get registry() {
    return exportRegistry;
  }
}

export const exportEngine =
  new ExportEngine();