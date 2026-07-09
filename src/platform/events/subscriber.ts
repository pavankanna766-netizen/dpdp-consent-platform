import {
  EventHandler,
} from "./event-types";

import { eventBus } from "./event-bus";

import {
  PlatformEventType,
} from "./platform-events";

export function subscribe(
  type: PlatformEventType,
  handler: EventHandler
) {
  eventBus.subscribe(type, handler);
}