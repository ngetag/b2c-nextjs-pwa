import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function jsonOk<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export function jsonCreated<T>(data: T): NextResponse<T> {
  return NextResponse.json(data, { status: 201 });
}

export function jsonError(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
): NextResponse<ApiErrorPayload> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status },
  );
}

export function handleApiError(error: unknown): NextResponse<ApiErrorPayload> {
  if (error instanceof ZodError) {
    return jsonError(
      "VALIDATION_ERROR",
      "Payload atau parameter tidak valid",
      422,
      error.issues,
    );
  }

  if (error instanceof SyntaxError) {
    return jsonError("INVALID_JSON", "Format JSON request tidak valid", 400);
  }

  const message =
    error instanceof Error ? error.message : "Terjadi kesalahan pada server";
  return jsonError("INTERNAL_ERROR", message, 500);
}
