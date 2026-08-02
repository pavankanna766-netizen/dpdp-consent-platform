"use client";

import { useEffect, useState } from "react";
import { Check, Shield, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    id: "free",
    name: "Free Sandbox",
    price: "₹0",
    period: "forever",
    description: "Ideal for local dev environments and testing scopes.",
    features: [
      "1 Sandbox Website Scan",
      "Draft Consent Preferences",
      "Manual Inventory Logs",
      "100 Consent Records / mo",
    ],
    color: "slate",
    icon: Shield,
  },
  {
    id: "starter",
    name: "Startup Plan",
    price: "₹3,500",
    period: "month",
    description: "Ideal for small Indian startups and micro-enterprises.",
    features: [
      "1 Production Website Integration",
      "Standard Cookie Banner Notice",
      "Privacy Policy Generator",
      "5,000 Consent Records / mo",
      "Standard Email Support",
    ],
    color: "indigo",
    icon: Shield,
  },
  {
    id: "growth",
    name: "Growing Business Plan",
    price: "₹8,500",
    period: "month",
    description: "Perfect for growing digital-first Indian businesses.",
    features: [
      "3 Website Integrations",
      "Bilingual Consent Notice (English/Hindi)",
      "Compliance Audits & Weekly Scans",
      "25,000 Consent Records / mo",
      "Priority Email & Chat Support",
    ],
    color: "violet",
    icon: Zap,
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    price: "Custom",
    period: "year",
    description: "For significant data fiduciaries with massive scaling requirements.",
    features: [
      "Unlimited Website Integrations",
      "All Regional Languages support",
      "Full API & Webhook access",
      "SLA Incident Response Manager",
      "Dedicated Technical Account Team",
    ],
    color: "amber",
    icon: Sparkles,
  },
];

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // 1. Dynamically load the standard Razorpay checkout script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    // 2. Fetch the active company's plan status from Clerk/Supabase session
    fetch("/api/company/current")
      .then((res) => res.json())
      .then((data) => {
        if (data.billing_status) {
          setCurrentPlan(data.billing_status);
        } else if (data.plan_id) {
          setCurrentPlan(data.plan_id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckout = async (plan: typeof PLANS[0]) => {
    if (plan.id === "free" || plan.id === currentPlan) return;

    if (plan.id === "enterprise") {
      alert("Enterprise tier requires a custom service contract. Please contact our compliance sales team at sales@privystack.in.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Request order details from the backend checkout API
      const checkoutRes = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planTier: plan.id }),
      });

      const checkoutData = await checkoutRes.json();
      if (checkoutData.error) {
        alert(checkoutData.error);
        setIsProcessing(false);
        return;
      }

      const orderData = checkoutData.order || checkoutData;

      // 2. Open the standard Razorpay Checkout window
      const options = {
        key: orderData.keyId || orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "PrivyStack Compliance",
        description: `Upgrade to ${plan.name}`,
        order_id: orderData.orderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          setIsProcessing(true);
          try {
            // 3. Cryptographically verify signature on the server
            const verifyRes = await fetch("/api/billing/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan.id,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert("Payment completed and verified successfully! Refreshing status.");
              window.location.reload();
            } else {
              alert(`Payment verification failed: ${verifyData.error}`);
            }
          } catch (err) {
            const error = err as Error;
            alert(`Failed to verify payment signature: ${error.message}`);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: checkoutData.companyName || "PrivyStack Org",
          email: "billing@privystack.in",
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new (window as typeof window & { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options);
      rzp.open();
    } catch (err) {
      const error = err as Error;
      alert(`Checkout failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">💳 Subscription & Billing</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Manage your PrivyStack compliance plan, billing history, and active Razorpay subscriptions.
        </p>
      </div>

      {/* Plan Summary */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase text-indigo-600 tracking-wider">Current Account Level</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-1 capitalize">
            {loading ? "Loading..." : `${currentPlan} Compliance Tier`}
          </h2>
          <p className="text-xs text-gray-500 mt-1">DPDP Consent Ledger Active status.</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <span className="text-xs text-gray-500">Billing Provider</span>
            <div className="text-lg font-bold text-gray-900 mt-0.5">Razorpay Secure</div>
          </div>
          <div className="h-10 w-px bg-gray-200"></div>
          <div className="text-right">
            <span className="text-xs text-gray-500">Currency</span>
            <div className="text-lg font-bold text-gray-900 mt-0.5">INR (₹)</div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        {PLANS.map((plan) => {
          const PlanIcon = plan.icon;
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border bg-white p-6 shadow-sm flex flex-col justify-between ${
                isCurrent ? "border-indigo-600 ring-1 ring-indigo-600" : "border-gray-200"
              }`}
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2.5 bg-slate-50 text-indigo-600`}>
                    <PlanIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-xs text-gray-500">/ {plan.period}</span>
                </div>

                <p className="mt-2 text-xs text-gray-500 leading-relaxed">{plan.description}</p>

                <ul className="mt-6 space-y-3.5 border-t pt-5 text-xs text-gray-600">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 border-t pt-5">
                <Button
                  className={`w-full font-semibold ${
                    isCurrent
                      ? "bg-slate-100 text-slate-500 hover:bg-slate-100 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                  onClick={() => handleCheckout(plan)}
                  disabled={isCurrent || isProcessing}
                >
                  {isCurrent ? "Current Active Plan" : `Upgrade to ${plan.name}`}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
