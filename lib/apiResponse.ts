import { NextResponse } from "next/server";
import { AuthorizationError } from "@/lib/auth";
import { ValidationError } from "@/lib/validation";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(error: string, status = 500) {
  return NextResponse.json({ success: false, error }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof ValidationError) {
    return errorResponse(error.message, 400);
  }

  if (error instanceof AuthorizationError) {
    return errorResponse(error.message, error.statusCode);
  }

  if (error instanceof SyntaxError) {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  console.error(error);
  return errorResponse("Internal server error.", 500);
}
