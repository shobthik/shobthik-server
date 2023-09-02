import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export default async function logError(
  err: Error,
  _: Request,
  res: Response,
  __: NextFunction,
) {
  console.error(err);
  return res
    .status(StatusCodes.BAD_REQUEST)
    .json({
      message: err.message,
    })
    .end();
}
