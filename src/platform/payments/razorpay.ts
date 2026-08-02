import Razorpay from "razorpay";

export function getRazorpayClient(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    if (process.env.NODE_ENV === "production" && !process.env.NEXT_PHASE) {
      throw new Error(
        "[FATAL STARTUP ERROR] Missing required Razorpay environment variables: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured."
      );
    }
  }

  return new Razorpay({
    key_id: key_id || "rzp_test_placeholder",
    key_secret: key_secret || "rzp_test_secret_placeholder",
  });
}

// Singleton Razorpay Instance
let razorpayInstance: Razorpay | null = null;

export const razorpay = new Proxy({} as Razorpay, {
  get(_target, prop: keyof Razorpay) {
    if (!razorpayInstance) {
      razorpayInstance = getRazorpayClient();
    }
    const val = (razorpayInstance as unknown as Record<string, unknown>)[prop as string];
    return typeof val === "function" ? val.bind(razorpayInstance) : val;
  },
});
