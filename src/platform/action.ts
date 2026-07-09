import { ensurePlatformInitialized } from "./init";

export async function withPlatform<T>(
  action: () => Promise<T>
): Promise<T> {
  ensurePlatformInitialized();

  try {
    return await action();
  } catch (error) {
    throw error;
  }
}