export class AppError extends Error {
  statusCode: number;
  code?: string;
  details?: unknown;

  constructor(message: string, statusCode = 500, code?: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message: string, details?: unknown) {
  return new AppError(message, 400, 'BAD_REQUEST', details);
}

export function unauthorized(message = 'Unauthorized') {
  return new AppError(message, 401, 'UNAUTHORIZED');
}

export function forbidden(message = 'Forbidden') {
  return new AppError(message, 403, 'FORBIDDEN');
}

export function notFound(message = 'Not Found') {
  return new AppError(message, 404, 'NOT_FOUND');
}

export function conflict(message = 'Conflict', details?: unknown) {
  return new AppError(message, 409, 'CONFLICT', details);
}
