import { Request, Response, NextFunction } from "express";
import { UserDao } from "../DAO/UserDao";
import { isJwtTokenValid } from "../utils/jwt";
import { returnUnauthorizedResponse } from "../utils/response";

export default async function extractUserFromRequestObject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer")) {
    return returnUnauthorizedResponse(res);
  }

  const bearerAndToken = authorizationHeader.split(" ");

  if (bearerAndToken.length !== 2) {
    return returnUnauthorizedResponse(res, "Access token missing");
  }

  const token = bearerAndToken[1];
  const [isTokenValid, tokenPayload] = await isJwtTokenValid(token);

  if (!isTokenValid || !tokenPayload) {
    return returnUnauthorizedResponse(res, "Access token is invalid");
  } else {
    const userDao = new UserDao();
    const userById = await userDao.getUserById(tokenPayload.sub as string);

    if (!userById) {
      return returnUnauthorizedResponse(res, "User does not exist");
    } else {
      req.user = userById;
    }
  }

  next();
}
