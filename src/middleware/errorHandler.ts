import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error:", err);

  const status = err.status || 500;
  const title = err.title || "Internal Server Error";
  const detail = err.detail || err.message || "An unexpected error occurred";

  return res.status(status).json({
    type: "application/problem+json",
    status,
    title,
    detail,
  });
};
