import type { PlatformEventType } from "./platform-events";
export interface PlatformEvent<T = unknown> {
  id: string;
  type: PlatformEventType;
  timestamp: Date;
  payload: T;
}

export type EventHandler<T = unknown> = (
  event: PlatformEvent<T>
) => Promise<void> | void;