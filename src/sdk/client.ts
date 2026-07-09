import {
  defaultConfig,
} from "./config";

import { ApiClient } from "./api";

import { logger } from "@/platform/logger";

import { VisitorManager } from "./visitor";

import type {
  PrivyStackConfig,
} from "./types";

export class PrivyStackClient {
  private readonly config: Required<PrivyStackConfig>;

  private readonly visitor =
    new VisitorManager();

  private readonly api: ApiClient;

  constructor(
    config: PrivyStackConfig
  ) {
    this.config = {
      ...defaultConfig,
      ...config,
    };

    this.api =
      new ApiClient(
        this.config.apiBaseUrl
      );
  }

  getConfig() {
    return this.config;
  }

  getApi() {
    return this.api;
  }

  getVisitorId() {
    return this.visitor.getVisitorId();
  }

  async init() {
    logger.info(
  "PrivyStack initialized"
);

logger.debug(
  "SDK configuration",
  this.config
);

logger.debug(
  "Visitor ID",
  this.visitor.getVisitorId()
);

    // Verify that the configured template exists.
    await this.api.get(
      `/template/${this.config.token}`
    );

    return this;
  }
}