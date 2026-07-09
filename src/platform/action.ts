import { ensurePlatformInitialized } from "./init";

export async function withPlatform<T>(
  action: () => Promise<T>
): Promise<T> {
  ensurePlatformInitialized();

  return action();
}