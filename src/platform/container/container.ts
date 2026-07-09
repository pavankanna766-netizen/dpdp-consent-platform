import type { PlatformService } from "../platform-service";

class ServiceRegistry {
  private services = new Map<
    string,
    PlatformService
  >();

  register(
    name: string,
    service: PlatformService
  ) {
    if (this.services.has(name)) {
      throw new Error(
        `Service "${name}" already registered`
      );
    }

    this.services.set(name, service);
  }

  get<T extends PlatformService>(
    name: string
  ): T {
    const service = this.services.get(name);

    if (!service) {
      throw new Error(
        `Service "${name}" not found`
      );
    }

    return service as T;
  }

  getAll() {
    return [...this.services.values()];
  }
}

export const container =
  new ServiceRegistry();