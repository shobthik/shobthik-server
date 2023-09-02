import { UserInputError } from "apollo-server-errors";
import { Appointment } from "../../entities/therapy/Appointment";
import { AppointmentReport } from "../../entities/therapy/AppointmentReport";
import {
  ETransactionStatus,
  Transaction,
} from "../../entities/transaction/Transaction";
import User, { EUserRole } from "../../entities/user/User";
import { checkAuth } from "../../middleware/checkAuth";
import { IGraphqlContext } from "../../types/types";
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UnauthorizedError,
} from "type-graphql";
import AppointmentCreateInput from "../input/AppointmentCreateInput";
import AppointmentReportInput from "../input/AppointmentReportInput";
import TherapistProfile from "../../entities/user/TherapistProfile";
import AppointmentUpdateInput from "../input/AppointmentUpdateInput";
import NotificationService from "../../DAO/NotificationService";
import { ENotificationContext } from "../../entities/notification/Notification";

@Resolver()
export default class TherapistResolver {
  @Mutation(() => Appointment)
  async createAppointment(
    @Arg("appointmentCreateInput")
    appointmentCreateInput: AppointmentCreateInput,
    @Ctx() ctx: IGraphqlContext,
  ): Promise<Appointment> {
    if (!checkAuth(ctx.req.user, [EUserRole.THERAPIST])) {
      throw new UnauthorizedError();
    }

    const userRepo = ctx.dbConnection.getRepository(User);
    const client = await userRepo.findOneOrFail(
      appointmentCreateInput.clientId,
    );

    const appointmentRepo = ctx.dbConnection.getRepository(Appointment);
    const transactionRepo = ctx.dbConnection.getRepository(Transaction);

    const transaction = await transactionRepo.findOneOrFail(
      appointmentCreateInput.transactionId,
      {
        where: {
          targetTherapist: ctx.req.user,
        },
        relations: ["client", "targetTherapist", "appointment"],
      },
    );

    if (transaction.appointment) {
      throw new UserInputError(
        "You cannot create a new appointment because an appointment against this appointment request already exists.",
      );
    }

    appointmentCreateInput.possibleDates.sort();

    const newAppointment = appointmentRepo.create({
      client,
      therapist: ctx.req.user,
      transaction: transaction,
      possibleDates: appointmentCreateInput.possibleDates,
    });
    await appointmentRepo.save(newAppointment);
    transaction.appointment = newAppointment;
    await transactionRepo.save(transaction);

    NotificationService.createNotificationInDatabase(
      ctx,
      ENotificationContext.THERAPY_APPOINTMENT_CREATED,
      newAppointment,
      client,
    );

    NotificationService.sendEmail(
      client.email,
      ENotificationContext.THERAPY_APPOINTMENT_CREATED,
    );

    return newAppointment;
  }

  @Mutation(() => Appointment)
  async updateAppointment(
    @Arg("appointmentUpdateInput")
    appointmentUpdateInput: AppointmentUpdateInput,
    @Ctx() ctx: IGraphqlContext,
  ): Promise<Appointment> {
    if (!checkAuth(ctx.req.user, [EUserRole.THERAPIST, EUserRole.CLIENT])) {
      throw new UnauthorizedError();
    }

    // if you are a client and tried to update therapist specific data
    if (
      ctx.req.user?.userRole === EUserRole.CLIENT &&
      (appointmentUpdateInput.meetLink || appointmentUpdateInput.possibleDates)
    ) {
      throw new UnauthorizedError();
    }

    // if you are a therapist and tried to update client specific data
    if (
      ctx.req.user?.userRole === EUserRole.THERAPIST &&
      appointmentUpdateInput.decidedDate
    ) {
      throw new UnauthorizedError();
    }

    const appointmentRepo = ctx.dbConnection.getRepository(Appointment);

    const appointment = await appointmentRepo.findOneOrFail(
      appointmentUpdateInput.id,
    );

    // a resolved appointment should not be modifiable
    if (appointment.resolved) {
      throw new UnauthorizedError();
    }

    appointment.decidedDate =
      appointmentUpdateInput.decidedDate || appointment.decidedDate;
    appointment.meetLink =
      appointmentUpdateInput.meetLink || appointment.meetLink;
    appointment.possibleDates =
      appointmentUpdateInput.possibleDates || appointment.possibleDates;
    appointment.resolved = appointmentUpdateInput.resolved;

    await appointmentRepo.save(appointment);

    const updatedAppointment = await appointmentRepo.findOneOrFail(
      appointment.id,
      {
        relations: ["client", "therapist", "transaction"],
      },
    );

    // if client updates, therapist should receive notification and vice-versa
    const targetToNotify =
      ctx.req.user?.userRole === EUserRole.CLIENT
        ? updatedAppointment.therapist
        : updatedAppointment.client;

    NotificationService.createNotificationInDatabase(
      ctx,
      ENotificationContext.THERAPY_APPOINTMENT_UPDATED,
      updatedAppointment,
      targetToNotify,
    );

    NotificationService.sendEmail(
      targetToNotify.email,
      ENotificationContext.THERAPY_APPOINTMENT_UPDATED,
    );

    return {
      ...updatedAppointment,
      possibleDates: updatedAppointment.possibleDates.map(
        (date) => new Date(date),
      ),
    };
  }

  // appointment report
  @Mutation(() => AppointmentReport)
  async fileAppointmentReport(
    @Arg("appointmentReportInput") appointmentReport: AppointmentReportInput,
    @Ctx() ctx: IGraphqlContext,
  ): Promise<AppointmentReport> {
    if (!checkAuth(ctx.req.user, [EUserRole.THERAPIST])) {
      throw new UnauthorizedError();
    }

    const { appointmentId, remarks } = appointmentReport;
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

    const appointmentReportRepo =
      ctx.dbConnection.getRepository(AppointmentReport);
    const appointmentReportObj = appointmentReportRepo.create({
      appointment,
      remarks: remarks,
    });

    return await appointmentReportRepo.save(appointmentReportObj);
  }

  @Query(() => [TherapistProfile])
  async getListOfTherapists(@Ctx() ctx: IGraphqlContext) {
    return ctx.dbConnection.getRepository(TherapistProfile).find({
      relations: [
        "baseUserProfile",
        "baseUserProfile.user",
        "baseUserProfile.education",
        "baseUserProfile.experiences",
      ],
    });
  }
}
