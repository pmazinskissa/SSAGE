export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class DatabaseConnectionError extends AppError {
  constructor(message = 'Database is not available') {
    super(message, 503, 'DB_UNAVAILABLE');
  }
}

export class DuplicateUserError extends AppError {
  constructor(message = 'An account with this email already exists') {
    super(message, 409, 'DUPLICATE_USER');
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Invalid email or password') {
    super(message, 401, 'AUTH_FAILED');
  }
}
