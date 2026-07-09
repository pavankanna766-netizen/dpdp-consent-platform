import { ZodSchema } from "zod";

import type {
  Middleware,
} from "./types";

export function validationMiddleware<T>(
  schema: ZodSchema<T>
): Middleware<T> {
  return async (context) => {
    schema.parse(context.body);
  };
}