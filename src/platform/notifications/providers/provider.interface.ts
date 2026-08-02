export interface SendNotificationOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  tags?: Array<{ name: string; value: string }>;
}

export interface SendNotificationResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
}

export interface NotificationProvider {
  readonly name: string;
  send(options: SendNotificationOptions): Promise<SendNotificationResult>;
}
