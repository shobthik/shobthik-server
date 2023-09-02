import {
  ETransactionStatus,
  Transaction,
} from "../../entities/transaction/Transaction";
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UnauthorizedError,
} from "type-graphql";
import TransactionInput from "../input/TransactionInput";
import { IGraphqlContext } from "../../types/types";
import { checkAuth } from "../../middleware/checkAuth";
import User, { EUserRole } from "../../entities/user/User";
import { UserInputError } from "apollo-server-errors";
import TherapistProfile from "../../entities/user/TherapistProfile";
import NotificationService from "../../DAO/NotificationService";
import { ENotificationContext } from "../../entities/notification/Notification";
import { FindConditions } from "typeorm";
import Admin from "../../entities/user/Admin";

@Resolver()
export default class TransactionResolver {
  @Query(() => Transaction, { nullable: true })
  async getUnresolvedTransaction(@Ctx() ctx: IGraphqlContext) {
    const currentLoggedInUser = ctx.req.user;

    if (!checkAuth(currentLoggedInUser, [EUserRole.CLIENT])) {
      throw new UnauthorizedError();
    }

    const transactionRepository = ctx.dbConnection.getRepository(Transaction);
    const unresolvedTransaction = await transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.client", "client")
      .leftJoinAndSelect("transaction.appointment", "appointment")
      .where("client.id = :userId", { userId: currentLoggedInUser?.id })
      .andWhere(
        `((transaction.status = :transactionStatus AND appointment.id is NULL) OR
        (transaction.status = :transactionStatus1 AND appointment.resolved is FALSE) OR
        transaction.status = :transactionStatus2)`,
        {
          transactionStatus: ETransactionStatus.APPROVED,
          transactionStatus1: ETransactionStatus.APPROVED,
          transactionStatus2: ETransactionStatus.PROCESSING,
        },
      )
      .getOne();

    return unresolvedTransaction;
  }

  @Mutation(() => Transaction)
  async createTransaction(
    @Arg("transactionInput") transactionInput: TransactionInput,
    @Ctx() ctx: IGraphqlContext,
  ): Promise<Transaction> {
    const currentLoggedInUser = ctx.req.user;

    if (!checkAuth(currentLoggedInUser, [EUserRole.CLIENT])) {
      throw new UnauthorizedError();
    }

    const unresolvedTransaction = await this.getUnresolvedTransaction(ctx);

    if (unresolvedTransaction) {
      throw new UserInputError(
        "You cannot start a new transaction until your old transaction is unresolved",
      );
    }

    const transactionRepository = ctx.dbConnection.getRepository(Transaction);
    const adminRepo = ctx.dbConnection.getRepository(Admin);

    const { targetTherapistId, ...rest } = transactionInput;
    const therapist = await ctx.dbConnection
      .getRepository(TherapistProfile)
      .createQueryBuilder("therapist")
      .leftJoinAndSelect("therapist.baseUserProfile", "baseUserProfile")
      .leftJoinAndSelect("baseUserProfile.user", "user")
      .where("therapist.id = :targetTherapistId", { targetTherapistId })
      .andWhere("user.userRole = :userRole", {
        userRole: EUserRole.THERAPIST,
      })
      .getOneOrFail();

    const transaction = transactionRepository.create({
      client: currentLoggedInUser,
      targetTherapist: therapist.baseUserProfile.user,
      ...rest,
    });

    const admins = (
      await adminRepo.find({
        select: ["email"],
      })
    ).map((admin) => admin.email);

    NotificationService.sendEmail(
      admins,
      ENotificationContext.TRANSACTION_CREATED,
      `A new transaction has been created by client #${currentLoggedInUser?.id}. Please check the payment method and verify the transaction before approval.`,
    );

    return await transactionRepository.save(transaction);
  }

  @Mutation(() => Boolean)
  async setTransactionStatus(
    @Arg("transactionId") transactionId: string,
    @Arg("status") status: ETransactionStatus,
    @Arg("remarksByAdmin", { nullable: true }) remarksByAdmin: string,
    @Ctx() ctx: IGraphqlContext,
  ): Promise<boolean> {
    const currentLoggedInUser = ctx.req.admin!;

    if (!checkAuth(currentLoggedInUser, [EUserRole.ADMIN])) {
      throw new UnauthorizedError();
    }

    const transactionRepository = ctx.dbConnection.getRepository(Transaction);
    const transaction = await transactionRepository.findOneOrFail(
      transactionId,
      {
        relations: ["client", "targetTherapist"],
      },
    );

    transaction.status = status;
    transaction.remarksByAdmin = remarksByAdmin;

    await transactionRepository.save(transaction);

    NotificationService.createNotificationInDatabase(
      ctx,
      status === ETransactionStatus.APPROVED
        ? ENotificationContext.TRANSACTION_APPROVED
        : ENotificationContext.TRANSACTION_DECLINED,
      transaction,
      transaction.client,
    );

    NotificationService.sendEmail(
      transaction.client.email,
      status === ETransactionStatus.APPROVED
        ? ENotificationContext.TRANSACTION_APPROVED
        : ENotificationContext.TRANSACTION_DECLINED,
    );

    if (status === ETransactionStatus.APPROVED) {
      NotificationService.createNotificationInDatabase(
        ctx,
        ENotificationContext.THERAPY_APPOINTMENT_REQUEST,
        transaction,
        transaction.targetTherapist,
      );

      NotificationService.sendEmail(
        transaction.targetTherapist.email,
        ENotificationContext.THERAPY_APPOINTMENT_REQUEST,
      );
    }

    return true;
  }

  @Query(() => [Transaction])
  async getTransactionsForWhichThereIsNoAppointment(
    @Ctx() ctx: IGraphqlContext,
  ): Promise<Transaction[]> {
    const currentLoggedInUser = ctx.req.user;

    if (!checkAuth(currentLoggedInUser, [EUserRole.THERAPIST])) {
      throw new UnauthorizedError();
    }

    return await ctx.dbConnection.getRepository(Transaction).find({
      where: {
        targetTherapist: currentLoggedInUser,
        appointment: null,
        status: ETransactionStatus.APPROVED,
      },
      relations: ["client", "targetTherapist", "appointment"],
    });
  }

  @Query(() => Transaction, { nullable: true })
  async getTransactionById(
    @Arg("transactionId") transactionId: string,
    @Ctx() ctx: IGraphqlContext,
  ): Promise<Transaction | undefined> {
    const currentLoggedInUser = ctx.req.user || ctx.req.admin;

    if (!checkAuth(currentLoggedInUser, [EUserRole.CLIENT, EUserRole.ADMIN])) {
      throw new UnauthorizedError();
    }

    const findConditions: FindConditions<Transaction> = {
      id: transactionId,
    };

    if (currentLoggedInUser!.userRole === EUserRole.CLIENT) {
      findConditions.client = currentLoggedInUser as User;
    }

    const transaction = await ctx.dbConnection
      .getRepository(Transaction)
      .findOne({
        where: findConditions,
        relations: ["client", "targetTherapist", "appointment"],
        order: {
          updatedAt: "DESC",
        },
      });

    // why do I need to this? IDK. Graphql serializers have trouble with string
    // date values, hence this "hack".
    if (transaction) {
      return {
        ...transaction,
        createdAt: new Date(transaction.createdAt),
        updatedAt: new Date(transaction.updatedAt),
        appointment: transaction.appointment
          ? {
              ...transaction.appointment,
              createdAt: new Date(transaction.appointment.createdAt),
              updatedAt: new Date(transaction.appointment.updatedAt),
              possibleDates: Array.isArray(
                transaction.appointment.possibleDates,
              )
                ? transaction.appointment.possibleDates.map(
                    (date) => new Date(date),
                  )
                : transaction.appointment.possibleDates,
              decidedDate: transaction.appointment.decidedDate
                ? new Date(transaction.appointment.decidedDate)
                : transaction.appointment.decidedDate,
            }
          : transaction.appointment,
      };
    }

    return transaction;
  }

  @Query(() => [Transaction])
  async getTransactionsForClient(@Ctx() ctx: IGraphqlContext) {
    const currentLoggedInUser = ctx.req.user;

    if (!checkAuth(currentLoggedInUser, [EUserRole.CLIENT])) {
      throw new UnauthorizedError();
    }

    const transactions = await ctx.dbConnection
      .getRepository(Transaction)
      .find({
        where: {
          client: currentLoggedInUser,
        },
        relations: ["client", "targetTherapist", "appointment"],
        order: {
          updatedAt: "DESC",
        },
      });

    return transactions.map((transaction) => {
      if (transaction.appointment) {
        return {
          ...transaction,
          appointment: {
            ...transaction.appointment,
            possibleDates: transaction.appointment?.possibleDates?.map(
              (date) => new Date(date),
            ),
          },
        };
      }

      return transaction;
    });
  }
}
