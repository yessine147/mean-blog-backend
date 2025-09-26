export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string = 'Bad Request') {
    return new AppError(message, 400, 'BAD_REQUEST');
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Forbidden') {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static notFound(message: string = 'Not Found') {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string = 'Conflict') {
    return new AppError(message, 409, 'CONFLICT');
  }

  static internal(message: string = 'Internal Server Error') {
    return new AppError(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}
