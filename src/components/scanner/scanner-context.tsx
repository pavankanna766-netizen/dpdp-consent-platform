"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type ScanStatus =
  | "idle"
  | "running"
  | "completed"
  | "failed";

interface ScannerContextValue {
  selectedScanId: string | null;

  setSelectedScanId: (
    id: string | null
  ) => void;

  refreshKey: number;

  refresh: () => void;

  status: ScanStatus;

  setStatus: (
    status: ScanStatus
  ) => void;
}

const ScannerContext =
  createContext<
    ScannerContextValue | undefined
  >(undefined);

export function ScannerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    selectedScanId,
    setSelectedScanId,
  ] = useState<string | null>(
    null
  );

  const [
    status,
    setStatus,
  ] = useState<ScanStatus>(
    "idle"
  );

  const [
    refreshKey,
    setRefreshKey,
  ] = useState(0);

  function refresh() {
    setRefreshKey(
      (value) => value + 1
    );
  }

  return (
    <ScannerContext.Provider
      value={{
        selectedScanId,
        setSelectedScanId,

        refreshKey,
        refresh,

        status,
        setStatus,
      }}
    >
      {children}
    </ScannerContext.Provider>
  );
}

export function useScanner() {
  const context =
    useContext(
      ScannerContext
    );

  if (!context) {
    throw new Error(
      "useScanner must be used inside ScannerProvider."
    );
  }

  return context;
}