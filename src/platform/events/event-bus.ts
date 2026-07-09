import {
  EventHandler,
  PlatformEvent,
} from "./event-types";

class EventBus {
  private handlers = new Map<
    string,
    EventHandler[]
  >();

  private globalHandlers: EventHandler[] = [];

  subscribe(
    eventType: string,
    handler: EventHandler
  ) {
    const handlers =
      this.handlers.get(eventType) ?? [];

    handlers.push(handler);

    this.handlers.set(
      eventType,
      handlers
    );
  }

  subscribeAll(
    handler: EventHandler
  ) {
    this.globalHandlers.push(handler);
  }

  async publish<T>(
    event: PlatformEvent<T>
  ) {
    for (const handler of this.globalHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(
          "[Global Event Error]",
          error
        );
      }
    }

    const handlers =
      this.handlers.get(event.type) ?? [];

    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(
          "[Event Error]",
          error
        );
      }
    }
  }
}

export const eventBus =
  new EventBus();