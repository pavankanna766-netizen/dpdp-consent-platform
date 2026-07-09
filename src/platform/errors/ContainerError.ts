import { AppError } from "./AppError";

export class ContainerError extends AppError {
  constructor(message: string) {
    super(
      message,
      500,
      "CONTAINER_ERROR"
    );
  }
}