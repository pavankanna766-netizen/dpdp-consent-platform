import { NextRequest } from "next/server";

import type {
  PipelineContext,
  PipelineHandler,
  PipelineOptions,
} from "./types";

import type {
  Middleware,
} from "../middleware";

export async function executePipeline<
  T,
  R,
>(
  options: PipelineOptions<T, R>
) {
  const {
    request,
    body,
    handler,
    middlewares = [],
  } = options;

  const clientIp =
    request.headers.get(
      "x-forwarded-for"
    ) ?? "localhost";

  const context: PipelineContext<T> = {
    request,
    body,
    clientIp,
  };

  for (const middleware of middlewares) {
    await middleware(context);
  }

  return handler(context);
}