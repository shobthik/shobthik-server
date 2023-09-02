import { UserInputError } from "apollo-server-errors";
import { Appointment } from "../../entities/therapy/Appointment";
import { AppointmentRating } from "../../entities/therapy/AppointmentRating";
import { ETransactionStatus } from "../../entities/transaction/Transaction";
import { EUserRole } from "../../entities/user/User";
import { checkAuth } from "../../middleware/checkAuth";
import { IGraphqlContext } from "../../types/types";
import { Arg, Ctx, Mutation, Resolver, UnauthorizedError } from "type-graphql";
import AppointmentRatingInput from "../input/AppointmentRatingInput";
import { AppointmentReport } from "../../entities/therapy/AppointmentReport";
import AppointmentReportInput from "../input/AppointmentReportInput";

@Resolver()
export default class AppointmentRatingResolver {
  @Mutation(() => AppointmentRating)
  async fileAppointmentRating(
    @Arg("appointmentRating") appointmentRatingInput: AppointmentRatingInput,
    @Ctx() ctx: IGraphqlContext,
  ): Promise<AppointmentRating> {
    if (!checkAuth(ctx.req.user, [EUserRole.CLIENT])) {
      throw new UnauthorizedError();
    }

    const { appointmentId, rating, remarks } = appointmentRatingInput;
    const appointmentRepo = ctx.dbConnection.getRepository(Appointment);
    const appointment = await appointmentRepo.findOneOrFail(appointmentId, {
      where: {
        client: ctx.req.user!,
        resolved: true,
      },
      relations: ["transaction"],
    });

    if (appointment.transaction.status !== ETransactionStatus.APPROVED) {
      throw new UserInputError(
        "The appointment in question has not been approved yet",
      );
    }

    const appointmentRatingRepo =
      ctx.dbConnection.getRepository(AppointmentRating);
    const appointmentRatingObj = appointmentRatingRepo.create({
      appointment,
      rating,
      remarks,
    });

    return await appointmentRatingRepo.save(appointmentRatingObj);
  }

  @Mutation(() => AppointmentReport)
  async fileAppointmentReport(
    @Arg("appointmentReport") appointmentReportInput: AppointmentReportInput,
    @Ctx() ctx: IGraphqlContext,
  ): Promise<AppointmentReport> {
    if (!checkAuth(ctx.req.user, [EUserRole.THERAPIST])) {
      throw new UnauthorizedError();
    }

    const { appointmentId, remarks } = appointmentReportInput;
    const appointmentRepo = ctx.dbConnection.getRepository(Appointment);
    const appointment = await appointmentRepo.findOneOrFail(appointmentId, {
      where: {
        therapist: ctx.req.user!,
        resolved: true,
      },
      relations: ["transaction"],
    });

    if (appointment.transaction.status !== ETransactionStatus.APPROVED) {
      throw new UserInputError(
        "The appointment in question has not been approved yet",
      );
    }

    const appointmentRatingRepo =
      ctx.dbConnection.getRepository(AppointmentRating);
    const appointmentRatingObj = appointmentRatingRepo.create({
      appointment,
      remarks,
    });

    return await appointmentRatingRepo.save(appointmentRatingObj);
  }
}
