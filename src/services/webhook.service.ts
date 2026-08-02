import crypto from "crypto";
import {
  listWebhookSubscriptions,
  recordWebhookDelivery,
  type WebhookSubscriptionRecord,
} from "@/repositories/webhook.repository";
import { monitoringService } from "@/platform/monitoring/sentry";

export class WebhookService {
  computeHmacSignature(payloadString: string, secret: string, timestamp: number): string {
    const signaturePayload = `${timestamp}.${payloadString}`;
    return crypto
      .createHmac("sha256", secret)
      .update(signaturePayload)
      .digest("hex");
  }

  async dispatchEvent(companyId: string, eventType: string, payload: Record<string, unknown>) {
    const subsRes = await listWebhookSubscriptions(companyId);
    const activeSubs = (subsRes.data || []).filter(
      (sub: WebhookSubscriptionRecord) =>
        sub.is_active && (sub.events.includes("*") || sub.events.includes(eventType))
    );

    if (activeSubs.length === 0) return;

    const timestamp = Math.floor(Date.now() / 1000);
    const payloadString = JSON.stringify(payload);

    for (const sub of activeSubs) {
      const signature = this.computeHmacSignature(payloadString, sub.secret, timestamp);
      const trace = monitoringService.startTrace(`webhook_dispatch:${eventType}`);

      try {
        const response = await fetch(sub.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-PrivyStack-Signature": `t=${timestamp},v1=${signature}`,
            "X-PrivyStack-Timestamp": String(timestamp),
            "User-Agent": "PrivyStack-Webhooks/1.0",
          },
          body: payloadString,
        });

        const respText = await response.text().catch(() => "");
        const isSuccess = response.ok;

        await recordWebhookDelivery({
          company_id: companyId,
          subscription_id: sub.id,
          event_type: eventType,
          payload,
          signature,
          response_status: response.status,
          response_body: respText.substring(0, 500),
          status: isSuccess ? "delivered" : "failed",
        });

        trace.finish({ status: isSuccess ? "delivered" : "failed", statusCode: response.status });
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        trace.finish({ status: "failed", error: errorMsg });

        await recordWebhookDelivery({
          company_id: companyId,
          subscription_id: sub.id,
          event_type: eventType,
          payload,
          signature,
          response_body: errorMsg,
          status: "failed",
        });
      }
    }
  }
}

export const webhookService = new WebhookService();
