import { Clock, generateId } from "@/platform/core";

import { eventBus } from "./event-bus";
import {
  PlatformEvent,
} from "./event-types";
import {
  PlatformEventType,
} from "./platform-events";

export async function publishEvent<T>(
  type: PlatformEventType,
  payload: T
) {
  const event: PlatformEvent<T> = {
    id: generateId(),
    type,
    timestamp: Clock.now(),
    payload,
  };
  await eventBus.publish(event);
}