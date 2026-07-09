export abstract class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);

    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super(
      "Unauthorized",
      "UNAUTHORIZED"
    );
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(
      `${resource} not found`,
      "NOT_FOUND"
    );
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(
      message,
      "CONFLICT"
    );
  }
}