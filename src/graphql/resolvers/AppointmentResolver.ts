import { Appointment } from "../../entities/therapy/Appointment";
import { Ctx, Query, Resolver, UnauthorizedError } from "type-graphql";
import { IGraphqlContext } from "../../types/types";
import { FindConditions } from "typeorm";
import { checkAuth } from "../../middleware/checkAuth";
import { EUserRole } from "../../entities/user/User";

@Resolver()
export default class AppointmentResolver {
  @Query(() => [Appointment])
  async getAppointmentsList(@Ctx() ctx: IGraphqlContext) {
    const currentLoggedInUser = ctx.req.user;

    if (
      !checkAuth(currentLoggedInUser, [EUserRole.CLIENT, EUserRole.THERAPIST])
    ) {
      throw new UnauthorizedError();
    }

    const findConditions: FindConditions<Appointment>[] = [];

    switch (currentLoggedInUser!.userRole) {
      case EUserRole.CLIENT:
        findConditions.push({
          client: currentLoggedInUser,
        });
        break;
      case EUserRole.THERAPIST:
        findConditions.push({
          therapist: currentLoggedInUser,
        });
        break;
    }

    const appointments = await ctx.dbConnection
      .getRepository(Appointment)
      .find({
        where: findConditions,
        relations: ["client", "therapist", "transaction"],
        order: {
          updatedAt: "DESC",
          decidedDate: "ASC",
        },
      });

    return appointments.map((appointment) => {
      return {
        ...appointment,
        possibleDates: appointment.possibleDates.map((date) => new Date(date)),
      };
    });
  }
}
