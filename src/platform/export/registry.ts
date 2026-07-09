import { ContainerError } from "@/platform/errors";

import {
  ExportFormat,
  ExportProvider,
} from "./types";

class ExportRegistry {
  private providers = new Map<
    ExportFormat,
    ExportProvider
  >();

  register(
    provider: ExportProvider
  ) {
    if (
      this.providers.has(
        provider.id
      )
    ) {
      throw new ContainerError(
        `Export provider "${provider.id}" already registered.`
      );
    }

    this.providers.set(
      provider.id,
      provider
    );
  }

  get(
    format: ExportFormat
  ) {
    const provider =
      this.providers.get(format);

    if (!provider) {
      throw new ContainerError(
        `Export provider "${format}" not found.`
      );
    }

    return provider;
  }

  getAll() {
    return [
      ...this.providers.values(),
    ];
  }
}

export const exportRegistry =
  new ExportRegistry();