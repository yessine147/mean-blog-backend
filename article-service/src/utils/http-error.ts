export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static accessDenied(message = 'Access denied') {
    return new AppError(message, 403, 'ACCESS_DENIED');
  }

  static badRequest(message = 'Bad request') {
    return new AppError(message, 400, 'BAD_REQUEST');
  }
}
