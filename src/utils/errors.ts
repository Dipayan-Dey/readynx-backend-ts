/**
 * Custom Error Classes for Enhanced Profile System
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.4, 15.2, 15.3
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for invalid input data
 */
export class ValidationError extends AppError {
  public readonly errors: any[];

  constructor(message: string, errors: any[] = []) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Authentication error for missing or invalid credentials
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401);
  }
}

/**
 * Authorization error for insufficient permissions
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403);
  }
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

/**
 * File upload error for file-related issues
 */
export class FileUploadError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * External API error for third-party service failures
 */
export class ExternalAPIError extends AppError {
  public readonly service: string;

  constructor(service: string, message: string) {
    super(`${service} API error: ${message}`, 502);
    this.service = service;
  }
}

/**
 * Database error for data persistence issues
 */
export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500);
  }
}

/**
 * Format error response for API responses
 * Ensures no sensitive data is exposed in error messages
 * 
 * Requirements: 13.3, 13.4, 15.2, 15.3
 */
export const formatErrorResponse = (error: any) => {
  // Default error response
  const response: any = {
    success: false,
    message: "An error occurred",
    timestamp: new Date().toISOString(),
  };

  // Handle known application errors
  if (error instanceof AppError) {
    response.message = error.message;
    response.statusCode = error.statusCode;

    // Include validation errors if present
    if (error instanceof ValidationError && error.errors.length > 0) {
      response.errors = error.errors;
    }

    // Include service name for external API errors
    if (error instanceof ExternalAPIError) {
      response.service = error.service;
    }
  } else if (error instanceof Error) {
    // Handle standard errors
    response.message = error.message || "Internal server error";
    response.statusCode = 500;
  } else {
    // Handle unknown error types
    response.message = "An unexpected error occurred";
    response.statusCode = 500;
  }

  // Never expose stack traces or sensitive data in production
  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  return response;
};

/**
 * Sanitize error message to remove sensitive information
 * 
 * Requirements: 13.3, 13.4
 */
export const sanitizeErrorMessage = (message: string): string => {
  // Remove potential sensitive patterns
  const sensitivePatterns = [
    /password[=:]\s*\S+/gi,
    /token[=:]\s*\S+/gi,
    /api[_-]?key[=:]\s*\S+/gi,
    /secret[=:]\s*\S+/gi,
    /mongodb:\/\/[^\s]+/gi,
    /Bearer\s+\S+/gi,
  ];

  let sanitized = message;
  sensitivePatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  });

  return sanitized;
};
