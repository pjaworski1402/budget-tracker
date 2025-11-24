import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

export function errorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error,
    },
    { status }
  );
}

export function validationErrorResponse(
  error: ZodError | { issues: Array<{ message?: string; path?: (string | number)[] }> }
): NextResponse<ApiResponse> {
  let issues: Array<{ message?: string; path?: (string | number)[] }>;
  
  if (error instanceof ZodError) {
    issues = error.issues.map(issue => ({
      message: issue.message,
      path: issue.path.filter((p): p is string | number => typeof p === 'string' || typeof p === 'number') as (string | number)[],
    }));
  } else if ('issues' in error) {
    issues = error.issues;
  } else {
    issues = [];
  }
  
  const firstError = issues?.[0];
  
  let errorMessage = 'Błąd walidacji';
  if (firstError) {
    if (firstError.message && !firstError.message.includes('expected')) {
      errorMessage = firstError.message;
    } else if (firstError.path?.[0]) {
      errorMessage = `${firstError.path[0]}: jest wymagane`;
    }
  }

  return errorResponse(errorMessage, 400);
}

export function unauthorizedResponse(message: string = 'Brak autoryzacji'): NextResponse<ApiResponse> {
  return errorResponse(message, 401);
}

export function notFoundResponse(message: string = 'Nie znaleziono'): NextResponse<ApiResponse> {
  return errorResponse(message, 404);
}

export function serverErrorResponse(message: string = 'Wystąpił błąd serwera'): NextResponse<ApiResponse> {
  return errorResponse(message, 500);
}

export function handleApiError(error: unknown, context: string): NextResponse<ApiResponse> {
  console.error(`${context} error:`, error);

  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode);
  }

  if (error instanceof ZodError || (error && typeof error === 'object' && 'issues' in error)) {
    return validationErrorResponse(error as ZodError);
  }

  return serverErrorResponse(`Wystąpił błąd podczas ${context}`);
}

