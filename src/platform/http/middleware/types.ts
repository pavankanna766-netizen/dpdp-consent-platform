import type { NextRequest } from "next/server";

export interface MiddlewareContext<T> {
  request: NextRequest;

  body: T;

  clientIp: string;
}

export type Middleware<T> = (
  context: MiddlewareContext<T>
) => Promise<void>;