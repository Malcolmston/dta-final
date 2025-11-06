// API Response Helpers and Error Handlers

import { NextResponse } from 'next/server';

/**
 * Standard API error response
 */
export interface ApiError {
  error: string;
  details?: string;
  code?: string;
  statusCode: number;
}

/**
 * Standard API success response
 */
export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  const response: ApiSuccess<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response, { status });
}

/**
 * Create error response
 */
export function createErrorResponse(
  error: string,
  statusCode: number = 500,
  details?: string,
  code?: string
): NextResponse {
  const response: ApiError = {
    error,
    statusCode,
  };

  if (details) {
    response.details = details;
  }

  if (code) {
    response.code = code;
  }

  console.error(`[API ERROR] ${statusCode}: ${error}`, details || '');

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Common error responses
 */
export const ApiErrors = {
  badRequest: (message: string = 'Bad request', details?: string) =>
    createErrorResponse(message, 400, details, 'BAD_REQUEST'),

  unauthorized: (message: string = 'Unauthorized', details?: string) =>
    createErrorResponse(message, 401, details, 'UNAUTHORIZED'),

  forbidden: (message: string = 'Forbidden', details?: string) =>
    createErrorResponse(message, 403, details, 'FORBIDDEN'),

  notFound: (message: string = 'Not found', details?: string) =>
    createErrorResponse(message, 404, details, 'NOT_FOUND'),

  methodNotAllowed: (message: string = 'Method not allowed', details?: string) =>
    createErrorResponse(message, 405, details, 'METHOD_NOT_ALLOWED'),

  rateLimitExceeded: (
    message: string = 'Rate limit exceeded',
    details?: string
  ) => createErrorResponse(message, 429, details, 'RATE_LIMIT_EXCEEDED'),

  internalError: (
    message: string = 'Internal server error',
    details?: string
  ) => createErrorResponse(message, 500, details, 'INTERNAL_ERROR'),

  serviceUnavailable: (
    message: string = 'Service unavailable',
    details?: string
  ) => createErrorResponse(message, 503, details, 'SERVICE_UNAVAILABLE'),
};

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: any,
  fields: string[]
): { valid: boolean; missing?: string[] } {
  const missing = fields.filter((field) => !body[field]);

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  return { valid: true };
}

/**
 * Sanitize file name to prevent path traversal
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path separators and special characters
  return fileName
    .replace(/[/\\]/g, '')
    .replace(/[^\w\s.-]/g, '')
    .slice(0, 255); // Limit length
}

/**
 * Get file extension from filename
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Check if file extension is allowed
 */
export function isAllowedExtension(
  fileName: string,
  allowedExtensions: string[]
): boolean {
  const ext = getFileExtension(fileName);
  return allowedExtensions.includes(ext);
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Validate file size
 */
export function validateFileSize(
  fileSize: number,
  maxSize: number
): { valid: boolean; error?: string } {
  if (fileSize > maxSize) {
    return {
      valid: false,
      error: `File size (${formatBytes(fileSize)}) exceeds maximum allowed size (${formatBytes(maxSize)})`,
    };
  }
  return { valid: true };
}

/**
 * Log API request
 */
export function logApiRequest(
  method: string,
  path: string,
  userId?: number,
  duration?: number
) {
  const timestamp = new Date().toISOString();
  const userInfo = userId ? `User ${userId}` : 'Anonymous';
  const durationInfo = duration ? `${duration}ms` : '';

  console.log(`[API] ${timestamp} ${method} ${path} - ${userInfo} ${durationInfo}`);
}

/**
 * Handle async errors in API routes
 */
export function asyncHandler(
  handler: (req: any, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: any, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(req, ...args);
    } catch (error: any) {
      console.error('[ASYNC ERROR]:', error);
      return createErrorResponse(
        'Internal server error',
        500,
        error.message,
        'INTERNAL_ERROR'
      );
    }
  };
}
