import { Response } from "express";
import { ApiError } from "./ApiError.js";
import { ZodError } from "zod";

export const throwIf = (
  condition: boolean,
  statusCode: number,
  message: string,
  errors: any[] = [],
  data?: any
) => {
  if (condition) {
    throw new ApiError(statusCode, message, errors, data);
  }
};

export const handleZodError = (error: ZodError) => {
  const formattedErrors = error.errors.map((e) => ({
    path: e.path.join("."),
    message: e.message,
  }));
  throw new ApiError(400, "Validation failed", formattedErrors);
};

export const sendSuccess = <T>(
  res: Response,
  statusCode: number = 200,
  message: string = "Success",
  data?: T
) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data: data ?? null,
    errors: [],
  });
};
