import type {
  NotificationProvider,
  SendNotificationOptions,
  SendNotificationResult,
} from "./provider.interface";

export class SmtpNotificationProvider implements NotificationProvider {
  readonly name = "smtp_fallback";

  async send(options: SendNotificationOptions): Promise<SendNotificationResult> {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;

    if (!smtpHost || !smtpPort) {
      return {
        success: false,
        provider: this.name,
        error: "SMTP environment variables (SMTP_HOST, SMTP_PORT) are not configured.",
      };
    }

    try {
      // In production serverless/worker environments, SMTP fallback dispatches via configured HTTP SMTP relay endpoint
      const relayUrl = process.env.SMTP_RELAY_URL || "https://smtp.privystack.com/v1/send";
      const response = await fetch(relayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SMTP-User": process.env.SMTP_USER || "",
          "X-SMTP-Pass": process.env.SMTP_PASS || "",
        },
        body: JSON.stringify({
          host: smtpHost,
          port: parseInt(smtpPort, 10),
          from: options.from || process.env.SMTP_FROM || "notifications@privystack.com",
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          provider: this.name,
          error: `SMTP relay returned HTTP ${response.status}`,
        };
      }

      const json = await response.json();
      return {
        success: true,
        messageId: json.messageId || `smtp_${Date.now()}`,
        provider: this.name,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        provider: this.name,
        error: msg,
      };
    }
  }
}

export const smtpProvider = new SmtpNotificationProvider();
