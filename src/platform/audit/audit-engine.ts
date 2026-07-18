import { eventBus } from "@/platform/events";
import type { PlatformService } from "@/platform/platform-service";
import { PlatformServices } from "@/platform/container/platform-services";

import { recordAuditLog } from "@/services/audit.service";
import { logger } from "@/platform/logger";

export class AuditEngine implements PlatformService {
  readonly name = PlatformServices.AUDIT;

  private initialized = false;

  initialize() {
    logger.info("AuditEngine initialized");
  if (this.initialized) {
    return;
  }

  this.initialized = true;

  eventBus.subscribeAll(async (event) => {
    logger.info(`[AUDIT] ${event.type}`, {
      id: event.id,
      timestamp: event.timestamp,
      payload: event.payload,
    });

    const payload =
      event.payload as Record<
        string,
        unknown
      >;

    if (!payload.companyId) {
      return;
    }

    try {
      await recordAuditLog({
        company_id:
          payload.companyId as string,
        event_type: event.type,
        entity_type:
          event.type.split(".")[0],
        entity_id:
          (payload.templateId as string) ??
          (payload.consentId as string) ??
          (payload.requestId as string) ??
          event.id,
        actor: "system",
        payload,
      });
    } catch (error) {
      logger.error(
        "[AUDIT ENGINE] Failed to record audit log:",
        error
      );
    }
  });
}

  dependencies() {
    return [];
  }
}

export const auditEngine = new AuditEngine();