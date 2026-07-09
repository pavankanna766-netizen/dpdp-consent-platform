import { PrivyStackClient } from "./client";

export * from "./types";

let client: PrivyStackClient | null = null;

export const PrivyStack = {
  init(config: ConstructorParameters<typeof PrivyStackClient>[0]) {
    client = new PrivyStackClient(config);

    return client.init();
  },

  getClient() {
    if (!client) {
      throw new Error(
        "PrivyStack has not been initialized."
      );
    }

    return client;
  },
};