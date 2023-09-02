import { withFilter } from "graphql-subscriptions";
import { Notification } from "../../entities/notification/Notification";
import { IGraphqlContext } from "../../types/types";
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  Root,
  Subscription,
  UnauthorizedError,
} from "type-graphql";
import SubscriptionEvents from "../enums/events";
import { checkAuth } from "../../middleware/checkAuth";
import { EUserRole } from "../../entities/user/User";
import NotificationInput from "../input/NotificationInput";

@Resolver()
export default class NotificationResolver {
  @Subscription({
    subscribe: withFilter(
      (_, __, { pubsub }: IGraphqlContext, ___) =>
        pubsub.asyncIterator(SubscriptionEvents.NEW_NOTIFICATION),
      (payload: Notification, _, { user }: IGraphqlContext, __) => {
        return Boolean(user?.id === payload.user.id);
      },
    ),
  })
  onNewNotification(@Root() payload: Notification): Notification {
    return {
      ...payload,
      createdAt: new Date(payload.createdAt),
    };
  }

  @Query(() => [Notification], { nullable: true })
  async getNotifications(@Ctx() ctx: IGraphqlContext): Promise<Notification[]> {
    const currentLoggedInUser = ctx.req.user;

    if (
      !checkAuth(currentLoggedInUser, [
        EUserRole.CLIENT,
        EUserRole.THERAPIST,
        EUserRole.VOLUNTEER,
      ])
    ) {
      throw new UnauthorizedError();
    }

    const notificationRepo = ctx.dbConnection.getRepository(Notification);
    return await notificationRepo.find({
      where: {
        user: currentLoggedInUser,
      },
      order: {
        createdAt: "DESC",
      },
      relations: ["user"],
    });
  }

  @Mutation(() => [Notification])
  async markNotificationsAsSeen(
    @Arg("notificationInput") notificationInput: NotificationInput,
    @Ctx() ctx: IGraphqlContext,
  ): Promise<Notification[]> {
    const currentLoggedInUser = ctx.req.user;

    if (
      !checkAuth(currentLoggedInUser, [
        EUserRole.CLIENT,
        EUserRole.THERAPIST,
        EUserRole.VOLUNTEER,
      ])
    ) {
      throw new UnauthorizedError();
    }

    const { notificationIds } = notificationInput;

    try {
      const result = await ctx.dbConnection
        .getRepository(Notification)
        .update(notificationIds, {
          seen: true,
        });
    } catch {
      return [];
    }

    return await ctx.dbConnection
      .getRepository(Notification)
      .findByIds(notificationIds);
  }
}
