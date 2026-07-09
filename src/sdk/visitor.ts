import {
  LocalStorageProvider,
} from "./storage";

const STORAGE_KEY =
  "privystack_visitor_id";

function generateVisitorId() {
  return crypto.randomUUID();
}

export class VisitorManager {
  private readonly storage =
    new LocalStorageProvider();

  getVisitorId() {
    let id =
      this.storage.get(
        STORAGE_KEY
      );

    if (!id) {
      id = generateVisitorId();

      this.storage.set(
        STORAGE_KEY,
        id
      );
    }

    return id;
  }

  clearVisitorId() {
    this.storage.remove(
      STORAGE_KEY
    );
  }
}