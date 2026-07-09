export abstract class AppError extends Error {
  readonly status: number;

  readonly code: string;

 protected constructor(
  message: string,
  status: number,
  code: string,
  public readonly cause?: unknown
) {
    super(message);

    this.name =
      new.target.name;

    this.status = status;

    this.code = code;

    Object.setPrototypeOf(
      this,
      new.target.prototype
    );
  }
}