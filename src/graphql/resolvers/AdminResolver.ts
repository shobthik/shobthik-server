import Admin from "../../entities/user/Admin";
import User, { EUserRole } from "../../entities/user/User";
import { EChatType, EMessageType, IGraphqlContext } from "../../types/types";
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UnauthorizedError,
} from "type-graphql";
import { UserInputError } from "apollo-server-express";
import UserRoleChangeInput from "../input/UserRoleChangeInput";
import {
  ETransactionStatus,
  Transaction,
} from "../../entities/transaction/Transaction";
import { checkAuth } from "../../middleware/checkAuth";
import AdminPasswordUpdateInput from "../input/AdminPasswordUpdateInput";
import { compareSync } from "bcrypt";
import {
  VolunteerStatistics,
  VolunteerActivityData,
} from "../../DAO/VolunteerActivity";
import Chat from "../../entities/chat/Chat";
import Message from "../../entities/message/Message";
import VolunteerProfile from "../../entities/user/VolunteerProfile";
import NotificationService from "../../DAO/NotificationService";
import { ENotificationContext } from "../../entities/notification/Notification";
@Resolver()
export default class AdminResolver {
  @Query(() => [User])
  async getUsersList(
    @Arg("userRole") userRole: EUserRole,
    @Ctx() ctx: IGraphqlContext,
  ) {
    if (!checkAuth(ctx.req.admin, [EUserRole.ADMIN])) {
      throw new UnauthorizedError();
    }

    if (userRole === EUserRole.ADMIN) {
      return await ctx.dbConnection.getRepository(Admin).find({
        where: {
          userRole,
        },
      });
    }

    return await ctx.dbConnection.getRepository(User).find({
      where: {
        userRole,
      },
      order: {
        id: "ASC",
      },
    });
  }

  @Mutation(() => Admin)
  async createAdmin(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() ctx: IGraphqlContext,
  ) {
    if (!checkAuth(ctx.req.admin, [EUserRole.ADMIN])) {
      throw new UnauthorizedError();
    }

    if (!email || !password) {
      throw new UserInputError("Email or password is invalid");
    }

    const existingAdmin = await Admin.findOne({
      where: {
        email,
      },
    });

    if (existingAdmin) {
      throw new UserInputError("Admin already exists");
    }

    const admins = (
      await ctx.dbConnection.getRepository(Admin).find({
        select: ["email"],
      })
    ).map((admin) => admin.email);

    const newAdmin = await Admin.create({ email, password }).save();

    NotificationService.sendEmail(
      admins,
      ENotificationContext.ADMIN_ADDED,
      `${ctx.req.admin!.email} has added ${email} as an admin.`,
    );

    return newAdmin;
  }

  @Mutation(() => Admin)
  async updateAdminPassword(
    @Arg("adminPasswordUpdateInput")
    adminPasswordUpdateInput: AdminPasswordUpdateInput,
    @Ctx() ctx: IGraphqlContext,
  ) {
    const currentLoggedInUser = ctx.req.admin;

    if (!checkAuth(currentLoggedInUser, [EUserRole.ADMIN])) {
      throw new UnauthorizedError();
    }

    const { email, newPassword, newPasswordConfirmation, oldPassword } =
      adminPasswordUpdateInput;

    const admin = await Admin.findOneOrFail({
      where: {
        email,
      },
    });

    const oldPasswordMatches = compareSync(oldPassword, admin.password);

    if (!oldPasswordMatches) {
      throw new UserInputError("Your old password is incorrect");
    }

    if (newPassword !== newPasswordConfirmation) {
      throw new UserInputError(
        "Your new password does not match with the confirmation new password",
      );
    }

    admin.password = newPassword;

    return await Admin.save(admin);
  }

  @Mutation(() => Boolean)
  async toggleUserStatus(
    @Arg("userRoleChangeInput") userRoleChangeInput: UserRoleChangeInput,
    @Ctx() context: IGraphqlContext,
  ): Promise<Boolean> {
    if (!checkAuth(context.req.admin, [EUserRole.ADMIN])) {
      throw new UnauthorizedError();
    }

    const { userId, shouldApproveUser, shouldBanUser } = userRoleChangeInput;

    if (
      typeof shouldApproveUser === "undefined" ||
      typeof shouldBanUser === "undefined"
    ) {
      throw new UserInputError(
        "You need to specify either approval or banned status",
      );
    }

    if (shouldApproveUser && shouldBanUser) {
      throw new UserInputError(
        "You cannot ban and approve a user simultaneously",
      );
    }

    const repository = context.dbConnection.getRepository(User);
    const user = await repository.findOneOrFail(userId);

    user.isApproved = shouldApproveUser;
    user.isBanned = shouldBanUser;

    await repository.save(user);

    return true;
  }

  @Mutation(() => User)
  async deleteUser(
    @Arg("userId") userId: number,
    @Ctx() ctx: IGraphqlContext,
  ): Promise<User> {
    const currentLoggedInUser = ctx.req.admin;

    if (!checkAuth(currentLoggedInUser, [EUserRole.ADMIN])) {
      throw new UnauthorizedError();
    }

    const userRepo = ctx.dbConnection.getRepository(User);
    const user = await userRepo.findOneOrFail({ id: userId });
    await userRepo.delete({ id: userId });

    return user;
  }

  @Query(() => [Transaction])
  async getTransactions(
    @Ctx() ctx: IGraphqlContext,
    @Arg("status", { nullable: true }) status?: ETransactionStatus,
  ): Promise<Transaction[]> {
    if (!checkAuth(ctx.req.admin, [EUserRole.ADMIN])) {
      throw new UnauthorizedError();
    }

    return await ctx.dbConnection.getRepository(Transaction).find({
      relations: ["client", "targetTherapist"],
      order: {
        createdAt: "DESC",
      },
    });
  }

  @Query(() => VolunteerStatistics)
  async getVolunteerActivitySummary(
    @Ctx() ctx: IGraphqlContext,
    @Arg("fromDate", { nullable: true }) fromDate?: string,
    @Arg("toDate", { nullable: true }) toDate?: string,
  ): Promise<VolunteerStatistics> {
    if (!checkAuth(ctx.req.admin, [EUserRole.ADMIN])) {
      throw new UnauthorizedError();
    }

    const parsedFromDate = fromDate ? new Date(fromDate) : null;
    const parsedToDate = toDate ? new Date(toDate) : null;

    const userRepo = ctx.dbConnection.getRepository(User);
    const chatRepo = ctx.dbConnection.getRepository(Chat);
    const messageRepo = ctx.dbConnection.getRepository(Message);

    const [volunteerData, numberOfVolunteers] = await userRepo.findAndCount({
      where: {
        userRole: EUserRole.VOLUNTEER,
        isApproved: true,
        isBanned: false,
        isNewUser: false,
      },
    });
    const totalNumberOfMessagesByVolunteersQuery = messageRepo
      .createQueryBuilder("message")
      .leftJoinAndSelect("message.chat", "chat")
      .where("message.type = :messageType", {
        messageType: EMessageType.VOLUNTEER_TO_CLIENT,
      })
      .andWhere("chat.chatType = :chatType", { chatType: EChatType.REGULAR });

    if (parsedFromDate) {
      totalNumberOfMessagesByVolunteersQuery.andWhere(
        "message.createdAt BETWEEN :from AND :to",
        { from: parsedFromDate, to: parsedToDate ?? new Date() },
      );
    }
    const totalNumberOfMessagesByVolunteers =
      await totalNumberOfMessagesByVolunteersQuery.getCount();

    const totalNumberOfMessagesByClientQuery = messageRepo
      .createQueryBuilder("message")
      .leftJoinAndSelect("message.chat", "chat")
      .where("message.type = :messageType", {
        messageType: EMessageType.CLIENT_TO_VOLUNTEER,
      })
      .andWhere("chat.chatType = :chatType", { chatType: EChatType.REGULAR });

    if (parsedFromDate) {
      totalNumberOfMessagesByClientQuery.andWhere(
        "message.createdAt BETWEEN :from AND :to",
        { from: parsedFromDate, to: parsedToDate ?? new Date() },
      );
    }
    const totalNumberOfMessagesByClients =
      await totalNumberOfMessagesByClientQuery.getCount();

    // find all chats and messages
    const chatsQuery = chatRepo
      .createQueryBuilder("chat")
      .leftJoinAndSelect("chat.messages", "messages");
    if (parsedFromDate) {
      chatsQuery.andWhere("chat.createdAt BETWEEN :from AND :to", {
        from: parsedFromDate,
        to: parsedToDate ?? new Date(),
      });
    }

    const chats = await chatsQuery.getMany();
    const totalNumberOfChatsCreated = chats.length;
    const numberOfChatsAccepted = chats.filter((chat) => {
      // find out the number of chats that have total number of messages
      // (client + volunteer combined) greater than the total number of
      // messages sent only by the client
      return (
        chat.messages.length >
        chat.messages.filter(
          (message) => message.type === EMessageType.CLIENT_TO_VOLUNTEER,
        ).length
      );
    }).length;
    const numberOfChatsIgnored =
      totalNumberOfChatsCreated - numberOfChatsAccepted;

    const messageCount: {
      senderId: number;
      firstName: string;
      lastName: string;
      count: string;
    }[] = await ctx.dbConnection.manager.query(
      `
      select u."id" as "senderId", bup."firstName", bup."lastName", count(m."content") 
      from users u
      left join message m
      on u.id = m."senderId"
      left join base_user_profile bup
      on bup."userIdentifier" = u.id 
      where u."user_role" = 'volunteer' and u."is_approved" is TRUE
      group by u."id", bup."firstName", bup."lastName", u."name";
      `,
    );

    return {
      numberOfVolunteers,
      totalNumberOfMessagesByVolunteers,
      totalNumberOfMessagesByClients,
      numberOfChatsIgnored,
      numberOfChatsAccepted,
      totalNumberOfChatsCreated,
      messagesCount: messageCount.map((datum) => ({
        messageCount: Number(datum.count),
        volunteerId: datum.senderId,
        volunteerName: datum.firstName + " " + datum.lastName,
      })),
    };
  }

  @Query(() => VolunteerActivityData)
  async getVolunteerActivityByVolunteerId(
    @Ctx() ctx: IGraphqlContext,
    @Arg("volunteerId") volunteerUserId: string,
  ): Promise<VolunteerActivityData> {
    if (!checkAuth(ctx.req.admin, [EUserRole.ADMIN])) {
      throw new UnauthorizedError();
    }

    const volunteerProfileRepo =
      ctx.dbConnection.getRepository(VolunteerProfile);
    const messageRepo = ctx.dbConnection.getRepository(Message);

    const volunteer = await volunteerProfileRepo
      .createQueryBuilder("volunteer")
      .leftJoinAndSelect("volunteer.baseUserProfile", "baseProfile")
      .leftJoinAndSelect("baseProfile.user", "user")
      .where("user.id = :volunteerId AND user.userRole = :userRole", {
        volunteerId: volunteerUserId,
        userRole: EUserRole.VOLUNTEER,
      })
      .getOneOrFail();

    const totalNumberOfMessagesSinceJoining = await messageRepo.count({
      where: {
        sender: volunteer.baseUserProfile.user,
      },
    });

    const recentMessages = await messageRepo
      .createQueryBuilder("message")
      .leftJoinAndSelect("message.chat", "chat")
      .leftJoinAndSelect("chat.client", "client")
      .where("chat.chatType = :chatType", { chatType: EChatType.REGULAR })
      .andWhere("message.sender.id = :volunteerId", {
        volunteerId: volunteer.baseUserProfile.user.id,
      })
      .orderBy("message.createdAt", "DESC")
      .limit(50)
      .getMany();

    return {
      volunteerUserId: Number(volunteerUserId),
      volunteerName:
        volunteer.baseUserProfile.firstName +
        " " +
        volunteer.baseUserProfile.lastName,
      volunteerEmail: volunteer.baseUserProfile.user.email,
      volunteerSince: volunteer.baseUserProfile.user.createdAt,
      volunteerImagePath: volunteer.baseUserProfile.user.image,
      activityData: {
        totalNumberOfMessagesSinceJoining,
        recentMessageData: recentMessages,
      },
    };
  }
}
