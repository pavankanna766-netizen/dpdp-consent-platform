import { NextResponse } from "next/server";

export function successResponse(
  data: unknown,
  status = 200,
  init?: Omit<ResponseInit, "status">
) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    {
      ...init,
      status,
    }
  );
}

export function validationErrorResponse(
  message: string,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      code: "VALIDATION_ERROR",
      message,
      details,
    },
    {
      status: 400,
    }
  );
}

export function notFoundResponse(
  message: string
) {
  return NextResponse.json(
    {
      success: false,
      code: "NOT_FOUND",
      message,
    },
    {
      status: 404,
    }
  );
}

export function unauthorizedResponse(
  message = "Unauthorized"
) {
  return NextResponse.json(
    {
      success: false,
      code: "UNAUTHORIZED",
      message,
    },
    {
      status: 401,
    }
  );
}

export function internalServerErrorResponse() {
  return NextResponse.json(
    {
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
    },
    {
      status: 500,
    }
  );
}

export function tooManyRequestsResponse(
  message = "Too many requests.",
  retryAfterSeconds = 60
) {
  return NextResponse.json(
    {
      success: false,
      code: "RATE_LIMITED",
      message,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}
