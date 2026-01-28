export class HttpError extends Error {
  public statusCode: number;
  public details?: Record<string, unknown>;

  constructor(statusCode: number, message: string, details?: Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
