import type { NextRequest } from "next/server";

import type {
  Middleware,
} from "../middleware";

export interface PipelineContext<T> {
  request: NextRequest;

  body: T;

  clientIp: string;
}

export type PipelineHandler<T, R> = (
  context: PipelineContext<T>
) => Promise<R>;

export interface PipelineOptions<
  T,
  R,
> {
  request: NextRequest;

  body: T;

  middlewares?: Middleware<T>[];

  handler: PipelineHandler<T, R>;
}