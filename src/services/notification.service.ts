import { notificationProviderManager } from "@/platform/notifications/providers/provider-manager";
import {
  renderWelcomeEmail,
  renderTeamInvitationEmail,
  renderConsentGrantedEmail,
  renderConsentWithdrawnEmail,
  renderDsarSubmittedEmail,
  renderDsarCompletedEmail,
  renderScannerCompletedEmail,
  renderPolicyPublishedEmail,
  renderVendorReviewReminderEmail,
  renderBillingNotificationEmail,
  type EmailBranding,
  type RenderedTemplate,
} from "@/platform/notifications/templates/email-templates";
import { getCompanyBranding } from "@/repositories/branding.repository";
import {
  createNotificationLog,
  getNotificationPreferences,
} from "@/repositories/notification.repository";
import { triggerJobOrchestrator } from "@/platform/jobs/orchestrator";
import { createAuditLog } from "@/repositories/audit.repository";
import { monitoringService } from "@/platform/monitoring/sentry";

export type NotificationCategory =
  | "welcome"
  | "team_invitation"
  | "consent_granted"
  | "consent_withdrawn"
  | "dsar_submitted"
  | "dsar_completed"
  | "scanner_completed"
  | "policy_published"
  | "vendor_reminder"
  | "billing";

export interface SendEmailPayload {
  companyId: string;
  recipientEmail: string;
  category: NotificationCategory;
  template: string;
  templateData: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export class NotificationService {
  // Asynchronous Dispatch via Background Job Queue (Never blocks API responses)
  async enqueueEmail(payload: SendEmailPayload) {
    const idempotencyKey = `email_${payload.companyId}_${payload.template}_${payload.recipientEmail}_${Date.now()}`;
    return triggerJobOrchestrator.trigger({
      companyId: payload.companyId,
      jobType: "NOTIFICATION_EMAIL",
      payload: payload as unknown as Record<string, unknown>,
      idempotencyKey,
    });
  }

  // Worker Queue Execution Handler
  async processNotificationJob(companyId: string, payload: SendEmailPayload) {
    const trace = monitoringService.startTrace(`notification_worker:${payload.template}`);

    try {
      // 1. Check User Notification Preferences
      const prefsRes = await getNotificationPreferences(companyId, payload.recipientEmail);
      const prefs = prefsRes.data?.preferences;

      if (prefs && prefs.security_alerts === false && payload.category === "scanner_completed") {
        console.log(`[NOTIFICATION SKIPPED] Email category ${payload.category} disabled for ${payload.recipientEmail}`);
        trace.finish({ status: "skipped_by_preferences" });
        return { success: true, status: "skipped_by_preferences" };
      }

      // 2. Fetch Company Branding
      const brandingRes = await getCompanyBranding(companyId);
      const brandingData = brandingRes.data;
      const branding: EmailBranding = {
        companyName: brandingData?.legal_entity_name || "Company Entity",
        logoUrl: brandingData?.logo_url,
        primaryColor: brandingData?.primary_color || "#4f46e5",
      };

      // 3. Render Responsive Email Template
      const rendered = this.renderTemplate(payload.template, branding, payload.templateData);

      // 4. Send via Provider Manager (Primary Resend + SMTP Fallback)
      const sendResult = await notificationProviderManager.sendWithFallback({
        to: payload.recipientEmail,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      });

      const status = sendResult.success ? "sent" : "failed";

      // 5. Store ONLY Metadata in Notification Log (NEVER Full Email Body)
      await createNotificationLog({
        company_id: companyId,
        event_type: payload.template,
        recipient_email: payload.recipientEmail,
        subject: rendered.subject,
        provider: sendResult.provider,
        status,
        metadata: {
          template: payload.template,
          category: payload.category,
          provider_message_id: sendResult.messageId || null,
          error: sendResult.error || null,
          delivered_at: sendResult.success ? new Date().toISOString() : null,
          ...payload.metadata,
        },
      });

      // 6. Audit Log Entry
      await createAuditLog({
        company_id: companyId,
        event_type: "EMAIL_NOTIFICATION_SENT",
        entity_type: "notification_logs",
        entity_id: sendResult.messageId || `msg_${Date.now()}`,
        actor: "system_notification_service",
        payload: {
          recipient: payload.recipientEmail,
          template: payload.template,
          status,
          provider: sendResult.provider,
          providerMessageId: sendResult.messageId,
        },
      });

      trace.finish({ status, provider: sendResult.provider });
      return sendResult;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      trace.finish({ status: "failed", error: errorMsg });

      monitoringService.captureException(error, {
        companyId,
        metadata: { template: payload.template, recipient: payload.recipientEmail },
      });

      throw error;
    }
  }

  // Template Resolver
  private renderTemplate(template: string, branding: EmailBranding, data: Record<string, unknown>): RenderedTemplate {
    switch (template) {
      case "welcome_email":
        return renderWelcomeEmail(branding, String(data.userName || "User"), String(data.loginUrl || "#"));
      case "team_invitation":
        return renderTeamInvitationEmail(branding, String(data.inviterName || "Admin"), String(data.roleName || "Member"), String(data.acceptUrl || "#"));
      case "consent_granted":
        return renderConsentGrantedEmail(branding, String(data.recipientEmail || ""), String(data.receiptId || ""));
      case "consent_withdrawn":
        return renderConsentWithdrawnEmail(branding, String(data.recipientEmail || ""));
      case "dsar_submitted":
        return renderDsarSubmittedEmail(branding, String(data.requestId || ""), Number(data.slaDays || 30));
      case "dsar_completed":
        return renderDsarCompletedEmail(branding, String(data.requestId || ""), data.downloadUrl ? String(data.downloadUrl) : undefined);
      case "scanner_completed":
        return renderScannerCompletedEmail(branding, String(data.targetUrl || ""), Number(data.score || 100), Number(data.findingsCount || 0));
      case "policy_published":
        return renderPolicyPublishedEmail(branding, String(data.policyType || "Privacy Policy"), Number(data.version || 1), String(data.publicUrl || "#"));
      case "vendor_reminder":
        return renderVendorReviewReminderEmail(branding, String(data.vendorName || "Subprocessor"), Number(data.daysRemaining || 30));
      case "billing_notification":
        return renderBillingNotificationEmail(
          branding,
          (data.status as "success" | "failure") || "success",
          String(data.planName || "Pro"),
          String(data.amount || "₹0"),
          data.invoiceUrl ? String(data.invoiceUrl) : undefined
        );
      default:
        return renderWelcomeEmail(branding, "User", "#");
    }
  }

  // Helper Methods for Domain Workflows
  async sendWelcome(companyId: string, recipientEmail: string, userName: string, loginUrl: string) {
    return this.enqueueEmail({
      companyId,
      recipientEmail,
      category: "welcome",
      template: "welcome_email",
      templateData: { userName, loginUrl },
    });
  }

  async sendInvitation(companyId: string, recipientEmail: string, inviterName: string, roleName: string, acceptUrl: string) {
    return this.enqueueEmail({
      companyId,
      recipientEmail,
      category: "team_invitation",
      template: "team_invitation",
      templateData: { inviterName, roleName, acceptUrl },
    });
  }

  async sendConsentGranted(companyId: string, recipientEmail: string, receiptId: string) {
    return this.enqueueEmail({
      companyId,
      recipientEmail,
      category: "consent_granted",
      template: "consent_granted",
      templateData: { recipientEmail, receiptId },
    });
  }

  async sendConsentWithdrawn(companyId: string, recipientEmail: string) {
    return this.enqueueEmail({
      companyId,
      recipientEmail,
      category: "consent_withdrawn",
      template: "consent_withdrawn",
      templateData: { recipientEmail },
    });
  }

  async sendDsarSubmitted(companyId: string, recipientEmail: string, requestId: string, slaDays = 30) {
    return this.enqueueEmail({
      companyId,
      recipientEmail,
      category: "dsar_submitted",
      template: "dsar_submitted",
      templateData: { requestId, slaDays },
    });
  }

  async sendDsarCompleted(companyId: string, recipientEmail: string, requestId: string, downloadUrl?: string) {
    return this.enqueueEmail({
      companyId,
      recipientEmail,
      category: "dsar_completed",
      template: "dsar_completed",
      templateData: { requestId, downloadUrl },
    });
  }

  async sendScannerCompleted(companyId: string, recipientEmail: string, targetUrl: string, score: number, findingsCount: number) {
    return this.enqueueEmail({
      companyId,
      recipientEmail,
      category: "scanner_completed",
      template: "scanner_completed",
      templateData: { targetUrl, score, findingsCount },
    });
  }

  async sendPolicyPublished(companyId: string, recipientEmail: string, policyType: string, version: number, publicUrl: string) {
    return this.enqueueEmail({
      companyId,
      recipientEmail,
      category: "policy_published",
      template: "policy_published",
      templateData: { policyType, version, publicUrl },
    });
  }

  async sendVendorReminder(companyId: string, recipientEmail: string, vendorName: string, daysRemaining: number) {
    return this.enqueueEmail({
      companyId,
      recipientEmail,
      category: "vendor_reminder",
      template: "vendor_reminder",
      templateData: { vendorName, daysRemaining },
    });
  }

  async sendBillingNotification(companyId: string, recipientEmail: string, status: "success" | "failure", planName: string, amount: string, invoiceUrl?: string) {
    return this.enqueueEmail({
      companyId,
      recipientEmail,
      category: "billing",
      template: "billing_notification",
      templateData: { status, planName, amount, invoiceUrl },
    });
  }
}

export const notificationService = new NotificationService();
