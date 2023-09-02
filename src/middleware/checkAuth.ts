import { IGraphqlContext } from "src/types/types";
import { AuthChecker } from "type-graphql";
import Admin from "../entities/user/Admin";
import User, { EUserRole } from "../entities/user/User";

/**
 * A utility middleware that checks whether a user is approved, not banned
 * and has the appropriate user role. The function uses the existence of the name
 * property on the User to check if it is Admin, since the Admins don't have a username
 *
 * @param currentLoggedInUser the currently logged in user, can be Admin or User
 * @param target the target to check for
 */
export const checkAuth = (
  currentLoggedInUser: User | Admin | undefined,
  targets: EUserRole[],
): boolean => {
  if (!currentLoggedInUser) return false;

  if ((currentLoggedInUser as User).name !== undefined) {
    /** This is a Client, Volunteer or Therapist */
    const loggedInUser = currentLoggedInUser as User;
    return (
      targets.includes(loggedInUser.userRole) &&
      loggedInUser.isApproved &&
      !loggedInUser.isBanned
    );
  }

  // admins don't have isApproved and isBanned fields
  return targets.includes(currentLoggedInUser.userRole);
};

export const graphqlAuthorizationChecker: AuthChecker<IGraphqlContext> = (
  { root, args, context: { req, user }, info },
  roles,
) => {
  const currentUser = req.user || req.admin || user;

  // if someone is querying for the list of therapists
  if (info.path.prev?.prev?.key === "getListOfTherapists") {
    return true;
  }

  // or trying to get the appointment list for the current logged in user
  if (info.path.prev?.prev?.prev?.key === "getAppointmentsList") {
    return true;
  }

  // or trying to get the transaction details for the current logged in user
  if (info.path.prev?.prev?.key === "getTransactionsForClient") {
    return true;
  }

  if (info.path.prev?.prev?.prev?.key === "getTransactionsForClient") {
    return true;
  }

  // view transaction details
  if (info.path.prev?.prev?.key === "getTransactionById") {
    return true;
  }

  // here we can read the user from context
  // and check his permission in the db against the `roles` argument
  // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]

  return roles.includes(currentUser?.userRole!);
};
