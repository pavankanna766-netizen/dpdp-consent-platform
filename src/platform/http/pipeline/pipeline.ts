import type {
  PipelineContext,
  PipelineOptions,
} from "./types";

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