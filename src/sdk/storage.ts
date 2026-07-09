export interface StorageProvider {
  get(key: string): string | null;

  set(
    key: string,
    value: string
  ): void;

  remove(key: string): void;
}

export class LocalStorageProvider
  implements StorageProvider
{
  get(key: string) {
    return localStorage.getItem(key);
  }

  set(
    key: string,
    value: string
  ) {
    localStorage.setItem(
      key,
      value
    );
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }
}