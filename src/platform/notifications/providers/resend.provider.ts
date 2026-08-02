import type {
  NotificationProvider,
  SendNotificationOptions,
  SendNotificationResult,
} from "./provider.interface";

export class ResendNotificationProvider implements NotificationProvider {
  readonly name = "resend";

  async send(options: SendNotificationOptions): Promise<SendNotificationResult> {
    const apiKey = process.env.RESEND_API_KEY;
    const defaultFrom = process.env.RESEND_FROM_EMAIL || "PrivyStack <notifications@privystack.com>";

    if (!apiKey) {
      return {
        success: false,
        provider: this.name,
        error: "RESEND_API_KEY environment variable is not configured.",
      };
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: options.from || defaultFrom,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
          tags: options.tags,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        return {
          success: false,
          provider: this.name,
          error: json.message || json.error || "Resend API dispatch failed.",
        };
      }

      return {
        success: true,
        messageId: json.id,
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

export const resendProvider = new ResendNotificationProvider();
