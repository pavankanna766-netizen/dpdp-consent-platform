import type {
  NotificationProvider,
  SendNotificationOptions,
  SendNotificationResult,
} from "./provider.interface";
import { resendProvider } from "./resend.provider";
import { smtpProvider } from "./smtp.provider";

export class NotificationProviderManager {
  private providers: NotificationProvider[] = [resendProvider, smtpProvider];

  registerProvider(provider: NotificationProvider) {
    this.providers.unshift(provider);
  }

  async sendWithFallback(options: SendNotificationOptions): Promise<SendNotificationResult> {
    let lastError = "No notification providers registered.";

    for (const provider of this.providers) {
      const result = await provider.send(options);
      if (result.success) {
        return result;
      }
      console.warn(`[NOTIFICATION PROVIDER] ${provider.name} failed: ${result.error}. Trying next provider...`);
      lastError = result.error || "Unknown provider error";
    }

    return {
      success: false,
      provider: "all_failed",
      error: `All notification providers failed. Last error: ${lastError}`,
    };
  }
}

export const notificationProviderManager = new NotificationProviderManager();
