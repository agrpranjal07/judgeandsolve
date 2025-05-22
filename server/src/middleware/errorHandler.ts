import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { errorResponse } from "../utils/ApiResponse.js";

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let status = "error";
  let message = "Something went very wrong!";
  let responseErrors: any[] = [];
  let responseData: any | undefined = undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    status = err.status;
    message = err.message;
    responseErrors = err.errors;
    responseData = err.data;

    if (
      process.env.NODE_ENV === "development" ||
      !err.isOperational ||
      err.statusCode >= 500
    ) {
      console.error("API Error:", {
        name: err.name,
        message,
        statusCode,
        status,
        isOperational: err.isOperational,
        errors: responseErrors,
        data: responseData,
        stack: err.stack,
      });
    }
  } else {
    console.error("UNEXPECTED ERROR:", err);
    if (process.env.NODE_ENV === "development") {
      message = err.message;
    }
  }

  return errorResponse(res, {
    statusCode,
    message,
    errors: responseErrors,
    data: responseData ?? null,
  });
};
