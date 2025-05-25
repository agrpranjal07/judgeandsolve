import { Response } from "express";

export type ApiResponseOptions<T = any> = {
  statusCode?: number;
  message?: string;
  data?: T;
  errors?: any[];
};

export const successResponse = <T>(
  res: Response,
  options: ApiResponseOptions<T>
) => {
  const {
    statusCode = 200,
    message = "Success",
    data = null,
    errors = [],
  } = options;

  return res.status(statusCode).json({
    status: "success",
    message,
    data,
    errors,
  });
};

export const errorResponse = <T>(
  res: Response,
  options: ApiResponseOptions<T>
) => {
  const {
    statusCode = 500,
    message = "Something went wrong",
    data = null,
    errors = [],
  } = options;

  return res.status(statusCode).json({
    status: `${statusCode}`.startsWith("4") ? "fail" : "error",
    message,
    data,
    errors,
  });
};
