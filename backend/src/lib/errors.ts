export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "CONFLICT"
  | "PAYLOAD_TOO_LARGE"
  | "VALIDATION_FAILED"
  | "RATE_LIMITED"
  | "INTERNAL";

export type FieldError = {
  readonly path: string;
  readonly message: string;
};

export type PublicErrorBody = {
  readonly ok: false;
  readonly code: ErrorCode;
  readonly message: string;
  readonly correlationId: string;
  readonly fields?: readonly FieldError[];
};

export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly fields: readonly FieldError[] | undefined;
  readonly exposeMessage: boolean;

  constructor(input: {
    readonly status: number;
    readonly code: ErrorCode;
    readonly message: string;
    readonly fields?: readonly FieldError[];
    readonly exposeMessage?: boolean;
    readonly cause?: unknown;
  }) {
    super(input.message, input.cause !== undefined ? { cause: input.cause } : undefined);
    this.name = "AppError";
    this.status = input.status;
    this.code = input.code;
    this.fields = input.fields;
    this.exposeMessage = input.exposeMessage ?? true;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", cause?: unknown) {
    super({
      status: 400,
      code: "BAD_REQUEST",
      message,
      ...(cause !== undefined ? { cause } : {}),
    });
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", cause?: unknown) {
    super({
      status: 401,
      code: "UNAUTHORIZED",
      message,
      exposeMessage: false,
      ...(cause !== undefined ? { cause } : {}),
    });
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", cause?: unknown) {
    super({
      status: 403,
      code: "FORBIDDEN",
      message,
      ...(cause !== undefined ? { cause } : {}),
    });
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", cause?: unknown) {
    super({
      status: 404,
      code: "NOT_FOUND",
      message,
      ...(cause !== undefined ? { cause } : {}),
    });
    this.name = "NotFoundError";
  }
}

export class MethodNotAllowedError extends AppError {
  constructor(message = "Method not allowed", cause?: unknown) {
    super({
      status: 405,
      code: "METHOD_NOT_ALLOWED",
      message,
      ...(cause !== undefined ? { cause } : {}),
    });
    this.name = "MethodNotAllowedError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", cause?: unknown) {
    super({
      status: 409,
      code: "CONFLICT",
      message,
      ...(cause !== undefined ? { cause } : {}),
    });
    this.name = "ConflictError";
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = "Payload too large", cause?: unknown) {
    super({
      status: 413,
      code: "PAYLOAD_TOO_LARGE",
      message,
      ...(cause !== undefined ? { cause } : {}),
    });
    this.name = "PayloadTooLargeError";
  }
}

export class ValidationError extends AppError {
  constructor(fields: readonly FieldError[], message = "Validation failed") {
    super({
      status: 422,
      code: "VALIDATION_FAILED",
      message,
      fields,
    });
    this.name = "ValidationError";
  }
}

export class RateLimitError extends AppError {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number, message = "Rate limit exceeded") {
    super({
      status: 429,
      code: "RATE_LIMITED",
      message,
    });
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class InternalError extends AppError {
  constructor(message = "Internal server error", cause?: unknown) {
    super({
      status: 500,
      code: "INTERNAL",
      message,
      exposeMessage: false,
      ...(cause !== undefined ? { cause } : {}),
    });
    this.name = "InternalError";
  }
}

export function toPublicError(
  error: unknown,
  correlationId: string,
): { readonly status: number; readonly body: PublicErrorBody } {
  if (error instanceof AppError) {
    const body: PublicErrorBody = {
      ok: false,
      code: error.code,
      message: error.exposeMessage ? error.message : "Request failed",
      correlationId,
      ...(error.fields !== undefined ? { fields: error.fields } : {}),
    };
    return { status: error.status, body };
  }

  return {
    status: 500,
    body: {
      ok: false,
      code: "INTERNAL",
      message: "Request failed",
      correlationId,
    },
  };
}
