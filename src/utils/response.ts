import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export function returnUnauthorizedResponse(res: Response, message?: string) {
  const responseMessage =
    message || "You are not authorized to perform this operation";

  return res.status(StatusCodes.UNAUTHORIZED).json({
    error: "Unauthorized",
    message: responseMessage,
  });
}
