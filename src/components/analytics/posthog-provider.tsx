"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { analyticsService } from "@/platform/analytics";

interface AnalyticsContextType {
  optOut: boolean;
  setOptOut: (optOut: boolean) => void;
  trackCustomEvent: (eventName: string, properties?: Record<string, unknown>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  optOut: false,
  setOptOut: () => {},
  trackCustomEvent: () => {},
});

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [optOut, setOptOutState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("privystack_analytics_optout") === "true";
    }
    return false;
  });

  const handleSetOptOut = (value: boolean) => {
    setOptOutState(value);
    analyticsService.setOptOut(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("privystack_analytics_optout", value ? "true" : "false");
    }
  };

  useEffect(() => {
    analyticsService.setOptOut(optOut);
  }, [optOut]);

  const trackCustomEvent = (eventName: string, properties?: Record<string, unknown>) => {
    if (optOut) return;
    analyticsService.capture("onboarding_started", {
      companyId: (properties?.companyId as string) || "client_tenant",
      properties: { eventName, ...properties },
    });
  };

  return (
    <AnalyticsContext.Provider value={{ optOut, setOptOut: handleSetOptOut, trackCustomEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
}
