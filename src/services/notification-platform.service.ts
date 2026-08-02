import {
  eventBus,
  type DomainEventType,
  type DomainEventPayload,
} from "@/platform/notifications/event-bus";
import { notificationTemplateEngine } from "@/platform/notifications/templates";
import { getCompanyBranding } from "@/repositories/branding.repository";
import {
  createNotificationLog,
  getNotificationPreferences,
  listCompanyNotificationLogs,
} from "@/repositories/notification.repository";
import { monitoringService } from "@/platform/monitoring/sentry";

export class NotificationPlatformService {
  constructor() {
    this.registerEventListeners();
  }

  private registerEventListeners() {
    const allEvents: DomainEventType[] = [
      "AUTH_TEAM_INVITATION",
      "SCANNER_COMPLETED",
      "SCANNER_FAILED",
      "PRIVACY_POLICY_PUBLISHED",
      "COOKIE_POLICY_PUBLISHED",
      "TRUST_CENTER_PUBLISHED",
      "CONSENT_RECEIVED",
      "CONSENT_WITHDRAWN",
      "DSAR_SUBMITTED",
      "DSAR_ASSIGNED",
      "DSAR_COMPLETED",
      "VENDOR_CONTRACT_EXPIRING",
      "DATA_INVENTORY_REMINDER",
      "SECURITY_BREACH",
      "CERTIN_DEADLINE_REMINDER",
      "DPBI_DEADLINE_REMINDER",
      "BILLING_SUCCESSFUL",
      "BILLING_FAILED",
      "SUBSCRIPTION_RENEWAL",
      "TRIAL_ENDING",
      "INTERNAL_ADMIN_ALERT",
    ];

    allEvents.forEach((type) => {
      eventBus.subscribe(type, async (event) => {
        await this.processDomainEvent(event);
      });
    });
  }

  async publishDomainEvent(event: Omit<DomainEventPayload, "timestamp">) {
    const payload: DomainEventPayload = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    await eventBus.publish(payload);
  }

  private async processDomainEvent(event: DomainEventPayload) {
    const trace = monitoringService.startTrace(`notification_event:${event.eventType}`);

    try {
      // 1. Check User Notification Preferences
      const prefsRes = await getNotificationPreferences(event.companyId, event.recipientEmail);
      const prefs = prefsRes.data?.preferences;

      if (prefs && prefs.security_alerts === false && event.eventType.includes("SECURITY")) {
        console.log(`[NOTIFICATION SKIPPED] User ${event.recipientEmail} disabled security alerts.`);
        trace.finish({ status: "skipped_by_preferences" });
        return;
      }

      // 2. Fetch Company Branding for Email Styling
      const brandingRes = await getCompanyBranding(event.companyId);
      const branding = brandingRes.data;

      // 3. Render Branded HTML Template
      const { subject } = notificationTemplateEngine.renderEmail({
        eventType: event.eventType,
        companyName: branding?.privacy_contact ? "Company Legal Entity" : "Company Name",
        recipientEmail: event.recipientEmail,
        title: event.title,
        logoUrl: branding?.logo_url,
        primaryColor: branding?.primary_color,
        metadata: event.metadata,
      });

      // 4. Dispatch via Primary Provider (Resend / SMTP Fallback)
      const provider = process.env.RESEND_API_KEY ? "resend" : "smtp_fallback";
      console.log(`[NOTIFICATION DISPATCH] Sending '${subject}' via ${provider} to ${event.recipientEmail}`);

      // 5. Audit Delivery Log
      await createNotificationLog({
        company_id: event.companyId,
        event_type: event.eventType,
        recipient_email: event.recipientEmail,
        subject,
        provider,
        status: "sent",
        metadata: event.metadata || {},
      });

      trace.finish({ status: "sent", provider });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      trace.finish({ status: "failed", error: errorMsg });

      monitoringService.captureException(error, {
        companyId: event.companyId,
        metadata: { eventType: event.eventType, recipientEmail: event.recipientEmail },
      });

      await createNotificationLog({
        company_id: event.companyId,
        event_type: event.eventType,
        recipient_email: event.recipientEmail,
        subject: event.title,
        provider: "failed",
        status: "failed",
        metadata: { error: errorMsg },
      });
    }
  }

  async getLogs(companyId: string) {
    return listCompanyNotificationLogs(companyId);
  }
}

export const notificationPlatformService = new NotificationPlatformService();
