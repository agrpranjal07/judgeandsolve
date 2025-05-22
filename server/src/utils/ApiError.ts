export class ApiError extends Error {
  statusCode: number;
  status: "fail" | "error";
  isOperational: boolean;
  errors: any[];
  data?: any;

  constructor(
    statusCode: number,
    message = "Something went wrong",
    errors: any[] = [],
    data?: any,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;
    this.errors = errors;
    this.data = data;

    Error.captureStackTrace(this, this.constructor);
  }
}
