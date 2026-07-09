"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { PrivyStack } from "@/sdk";

import { sdkConfig } from "@/config/sdk";

import { initializePlatform } from "@/platform/bootstrap";

type SdkContextValue = {
  ready: boolean;
};

const SdkContext =
  createContext<SdkContextValue>({
    ready: false,
  });

export function useSdk() {
  return useContext(
    SdkContext
  );
}

export function SdkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] =
    useState(false);

  useEffect(() => {
    async function initialize() {
  try {
    // Initialize client-side platform services
    initializePlatform();

    // Initialize SDK
    await PrivyStack.init({
  token:
    sdkConfig.templateToken,
});

    setReady(true);
  } catch (error) {
    console.error(
      "Failed to initialize SDK",
      error
    );
  }
}

    initialize();
  }, []);

  const value = useMemo(
    () => ({
      ready,
    }),
    [ready]
  );

  if (!ready) {
    return null;
  }

  return (
    <SdkContext.Provider
      value={value}
    >
      {children}
    </SdkContext.Provider>
  );
}