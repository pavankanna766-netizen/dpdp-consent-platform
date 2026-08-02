export type DomainEventType =
  | "AUTH_TEAM_INVITATION"
  | "SCANNER_COMPLETED"
  | "SCANNER_FAILED"
  | "PRIVACY_POLICY_PUBLISHED"
  | "COOKIE_POLICY_PUBLISHED"
  | "TRUST_CENTER_PUBLISHED"
  | "CONSENT_RECEIVED"
  | "CONSENT_WITHDRAWN"
  | "DSAR_SUBMITTED"
  | "DSAR_ASSIGNED"
  | "DSAR_COMPLETED"
  | "VENDOR_CONTRACT_EXPIRING"
  | "DATA_INVENTORY_REMINDER"
  | "SECURITY_BREACH"
  | "CERTIN_DEADLINE_REMINDER"
  | "DPBI_DEADLINE_REMINDER"
  | "BILLING_SUCCESSFUL"
  | "BILLING_FAILED"
  | "SUBSCRIPTION_RENEWAL"
  | "TRIAL_ENDING"
  | "INTERNAL_ADMIN_ALERT";

export interface DomainEventPayload {
  companyId: string;
  eventType: DomainEventType;
  recipientEmail: string;
  title: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

type EventListener = (event: DomainEventPayload) => Promise<void>;

export class EventBus {
  private listeners: Map<DomainEventType, EventListener[]>;

  constructor() {
    this.listeners = new Map();
  }

  subscribe(type: DomainEventType, listener: EventListener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  async publish(event: DomainEventPayload) {
    const list = this.listeners.get(event.eventType) || [];
    console.log(`[EVENT BUS PUBLISH] ${event.eventType} for ${event.recipientEmail}`);

    await Promise.all(
      list.map((fn) =>
        fn(event).catch((err) =>
          console.error(`[EVENT BUS ERROR] Listener failed for ${event.eventType}`, err)
        )
      )
    );
  }
}

export const eventBus = new EventBus();
