import Admin from "./entities/user/Admin";
import User from "./entities/user/User";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      admin?: Admin;
    }
  }
}
