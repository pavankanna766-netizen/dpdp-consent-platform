"use client";

import { useState } from "react";
import { CreditCard, Check, Shield, Zap, Sparkles, Building2, Landmark, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "₹2,999",
    period: "month",
    description: "Ideal for small Indian startups and micro-enterprises.",
    features: [
      "1 Website Integration",
      "Basic Consent Banner",
      "Privacy Policy Generator",
      "1,000 Consent Records / mo",
      "Standard Email Support",
    ],
    color: "indigo",
    icon: Shield,
  },
  {
    id: "growth",
    name: "Growth",
    price: "₹7,999",
    period: "month",
    description: "Perfect for growing digital-first Indian businesses.",
    features: [
      "5 Website Integrations",
      "Advanced Banner Customization",
      "Automated Privacy Scanner",
      "DSAR & Audit Logs Access",
      "10,000 Consent Records / mo",
      "Priority Support (24h SLA)",
    ],
    color: "violet",
    icon: Zap,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "₹14,999",
    period: "month",
    description: "For Significant Data Fiduciaries requiring complete compliance.",
    features: [
      "Unlimited Website Integrations",
      "Full API & Embeddable SDK Access",
      "Custom Branding & Styling",
      "Dedicated DPO Support Channel",
      "Unlimited Consent Records / mo",
      "Independent Audit Ledger Exports",
    ],
    color: "purple",
    icon: Sparkles,
  },
];

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("starter");
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [upiId, setUpiId] = useState("user@okaxis");

  const handleCheckout = (plan: typeof PLANS[0]) => {
    if (plan.id === currentPlan) return;
    setSelectedPlan(plan);
    setIsSuccess(false);
  };

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setCurrentPlan(selectedPlan!.id);
      setTimeout(() => {
        setSelectedPlan(null);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">💳 Subscription & Billing</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Manage your PrivyStack compliance plan, billing history, and Razorpay subscription.
        </p>
      </div>

      {/* Plan Summary */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase text-indigo-600 tracking-wider">Current Account Level</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-1 capitalize">{currentPlan} Compliance Tier</h2>
          <p className="text-xs text-gray-500 mt-1">Next renewal date: August 18, 2026</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <span className="text-xs text-gray-500">Consent Usage</span>
            <div className="text-lg font-bold text-gray-900 mt-0.5">342 / 1,000</div>
          </div>
          <div className="h-10 w-px bg-gray-200"></div>
          <div className="text-right">
            <span className="text-xs text-gray-500">Monitored Domains</span>
            <div className="text-lg font-bold text-gray-900 mt-0.5">1 / 1</div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const PlanIcon = plan.icon;
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border bg-white p-6 shadow-sm flex flex-col justify-between ${
                plan.popular ? "border-indigo-600 ring-1 ring-indigo-600" : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                  Most Popular
                </span>
              )}

              <div>
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg bg-${plan.color}-50 p-2.5 text-${plan.color}-600`}>
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
                  className={`w-full ${
                    isCurrent
                      ? "bg-slate-100 text-slate-500 hover:bg-slate-100 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                  onClick={() => handleCheckout(plan)}
                  disabled={isCurrent}
                >
                  {isCurrent ? "Current Active Plan" : `Upgrade to ${plan.name}`}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Razorpay Simulation Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-150 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Razorpay Header */}
            <div className="bg-[#17252a] px-6 py-4 flex items-center justify-between text-white border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded bg-indigo-500 flex items-center justify-center font-bold text-white text-xs">P</div>
                <div>
                  <h4 className="text-sm font-semibold tracking-tight">PrivyStack Payment</h4>
                  <p className="text-[10px] text-gray-400">Order ID: pay_ps_sub_${Date.now().toString().slice(-6)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-indigo-300">{selectedPlan.price}</p>
                <p className="text-[9px] text-gray-400">Razorpay Secure</p>
              </div>
            </div>

            {/* Payment Body */}
            {isSuccess ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                <Check className="h-14 w-14 text-green-500 bg-green-50 rounded-full p-2.5 animate-bounce" />
                <h3 className="text-lg font-bold text-gray-900">Subscription Upgraded!</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your payment of **{selectedPlan.price}** has been processed successfully through Razorpay. Your account limits have been updated.
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Payment Method</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center transition-all ${
                        paymentMethod === "card" ? "border-indigo-600 bg-indigo-50/20 text-indigo-600" : "border-gray-200 hover:bg-slate-50"
                      }`}
                    >
                      <CreditCard className="h-5 w-5" />
                      <span className="text-[10px] font-semibold">Card</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("upi")}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center transition-all ${
                        paymentMethod === "upi" ? "border-indigo-600 bg-indigo-50/20 text-indigo-600" : "border-gray-200 hover:bg-slate-50"
                      }`}
                    >
                      <QrCode className="h-5 w-5" />
                      <span className="text-[10px] font-semibold">UPI / QR</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("netbanking")}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center transition-all ${
                        paymentMethod === "netbanking" ? "border-indigo-600 bg-indigo-50/20 text-indigo-600" : "border-gray-200 hover:bg-slate-50"
                      }`}
                    >
                      <Landmark className="h-5 w-5" />
                      <span className="text-[10px] font-semibold">Netbanking</span>
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  {paymentMethod === "card" && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-[10px] font-bold uppercase text-gray-400">Card Number</Label>
                        <Input type="text" placeholder="4111 2222 3333 4444" className="mt-1 font-mono text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-[10px] font-bold uppercase text-gray-400">Expiry</Label>
                          <Input type="text" placeholder="MM / YY" className="mt-1 font-mono text-sm" />
                        </div>
                        <div>
                          <Label className="text-[10px] font-bold uppercase text-gray-400">CVV</Label>
                          <Input type="password" placeholder="***" className="mt-1 font-mono text-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "upi" && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-[10px] font-bold uppercase text-gray-400">UPI ID / VPA</Label>
                        <Input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="mt-1 font-mono text-sm"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        A collect request will be sent to this VPA. Open your UPI application to authorize the transaction.
                      </p>
                    </div>
                  )}

                  {paymentMethod === "netbanking" && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-gray-400">Popular Indian Banks</Label>
                      <select className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none">
                        <option>State Bank of India (SBI)</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 border-t pt-5">
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedPlan(null)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-[#17252a] hover:bg-slate-800 text-white flex items-center justify-center gap-1.5"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : `Pay ${selectedPlan.price}`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
