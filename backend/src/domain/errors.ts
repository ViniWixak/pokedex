export class AppError extends Error {
  constructor(public message: string, public status = 400) {
    super(message);
  }
}
export class NotFoundError extends AppError {
  constructor(msg = "Resource not found") { super(msg, 404); }
}
export class ConflictError extends AppError {
  constructor(msg = "Conflict") { super(msg, 409); }
}
