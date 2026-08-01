import { AppError } from "./AppError";

export class RateLimitError
  extends AppError
{
  public readonly retryAfterSeconds: number;

  constructor(
    message =
      "Too many requests.",
    retryAfterSeconds = 60
  ) {
    super(
      message,
      429,
      "RATE_LIMIT"
    );
    this.retryAfterSeconds = retryAfterSeconds;
  }
}