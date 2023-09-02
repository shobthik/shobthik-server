import { EChatType, EMessageType, IGraphqlContext } from "../../types/types";
import { performance } from "perf_hooks";
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
import MessageInput from "../input/MessageInput";
import { AuthenticationError, UserInputError } from "apollo-server-errors";
import SubscriptionEvents from "../enums/events";
import Chat from "../../entities/chat/Chat";
import { withFilter } from "graphql-subscriptions";
import Message from "../../entities/message/Message";
import { ApolloError } from "apollo-server-express";
import { EUserRole } from "../../entities/user/User";
import ChatSignOffInput from "../input/ChatSignOffInput";
import BlockRecord from "../../entities/user/BlockRecord";
import { findBlockedUserIds } from "./BlockUserResolver";

async function getBlockedUserIdList(loggedInUserId: number) {
  const blockRecords = await BlockRecord.getBlockRecordsForCurrentUser(
    loggedInUserId,
  );
  const blockedUserIds = findBlockedUserIds(blockRecords);
  return blockedUserIds;
}

@Resolver()
export default class MessageResolver {
  // volunteers will subscribe to this topic
  @Subscription({
    subscribe: withFilter(
      (parent, args, { pubsub, user }: IGraphqlContext, info) =>
        pubsub.asyncIterator(SubscriptionEvents.NEW_CHAT_CREATED),
      async (payload: Chat, variables, { user }: IGraphqlContext) => {
        // user is defined in a subscription
        const blockedUserIds = await getBlockedUserIdList(user!.id);

        console.log(!blockedUserIds.includes(payload.client.id));

        // only show chats that are not created by blocked users
        return (
          user?.userRole === EUserRole.VOLUNTEER &&
          !blockedUserIds.includes(payload.client.id) &&
          payload.chatType === variables.chatType
        );
      },
    ),
  })
  onNewChatCreated(
    @Arg("chatType") chatType: EChatType,
    @Root() payload: Chat,
  ): Chat {
    // @ts-ignore
    return {
      ...payload,
      createdAt: new Date(payload.createdAt),
      lastMessageAt: new Date(payload.lastMessageAt),
      // @ts-ignore
      messages: payload.messages.map((message) => {
        return {
          ...message,
          createdAt: new Date(message.createdAt),
        };
      }),
    };
  }

  // clients will subscribe to this event
  @Subscription({
    subscribe: withFilter(
      (parent, args, { pubsub, user }: IGraphqlContext, info) => {
        return pubsub.asyncIterator(SubscriptionEvents.CHAT_REQUEST_ACCEPTED);
      },
      (payload: Chat, variables) => payload.chatId === variables.chatId,
    ),
  })
  onChatRequestAccepted(
    @Arg("chatId") chatId: string,
    @Root() payload: Chat,
  ): Chat {
    // @ts-ignore
    return {
      ...payload,
      createdAt: new Date(payload.createdAt),
      lastMessageAt: new Date(payload.lastMessageAt),
      // @ts-ignore
      messages: payload.messages.map((message) => {
        return {
          ...message,
          createdAt: new Date(message.createdAt),
        };
      }),
    };
  }

  // both volunteers and clients will subscribe to this
  @Subscription({
    subscribe: withFilter(
      (parent, args, { pubsub }: IGraphqlContext) =>
        pubsub.asyncIterator(SubscriptionEvents.NEW_MESSAGE),
      async (
        { chat, type, sender }: Message,
        variables,
        { user }: IGraphqlContext,
      ) => {
        if (user!.userRole === EUserRole.VOLUNTEER) {
          const blockedUserIds = await getBlockedUserIdList(user!.id);

          return (
            chat.chatId === variables.chatId &&
            !blockedUserIds.includes(sender.id)
          );
        }

        // client does not have block option
        return chat.chatId === variables.chatId;
      },
    ),
  })
  onNewMessage(
    @Arg("chatId") chatId: string,
    @Root() payload: Message,
  ): Message {
    // @ts-ignore
    return {
      ...payload,
      createdAt: new Date(payload.createdAt),
      // @ts-ignore
      chat: payload.chat
        ? {
            ...payload.chat,
            createdAt: new Date(payload.chat.createdAt),
            lastMessageAt: new Date(payload.chat.lastMessageAt),
          }
        : undefined,
    };
  }

  @Query(() => [Chat])
  async getExistingChats(
    @Arg("chatType") chatType: EChatType,
    @Ctx() { req, dbConnection, ...rest }: IGraphqlContext,
  ): Promise<Chat[]> {
    if (!(req.user?.userRole === EUserRole.VOLUNTEER)) {
      throw new UnauthorizedError();
    }

    const threshold = 6 * 3600 * 1000; // 6 hours
    const lastHour = new Date(Date.now() - threshold);

    let resultQuery = dbConnection
      .getRepository(Chat)
      .createQueryBuilder("chat")
      .leftJoinAndSelect("chat.client", "client")
      .leftJoinAndSelect("chat.volunteer", "volunteer")
      .leftJoinAndSelect("chat.messages", "messages")
      .leftJoinAndSelect("messages.sender", "sender");

    if (chatType === EChatType.REGULAR) {
      const blockedUserIds = await getBlockedUserIdList(req.user.id);

      resultQuery = resultQuery.where(
        `((chat.volunteer.id = :volunteerId AND chat.lastMessageAt > :lastHour1) OR (chat.volunteer.id IS NULL AND chat.lastMessageAt > :lastHour1))`,
        {
          volunteerId: req.user.id,
          lastHour1: lastHour,
        },
      );

      if (blockedUserIds.length > 0) {
        resultQuery = resultQuery.andWhere(
          "chat.client.id NOT IN (:...blockedUserIds)",
          {
            blockedUserIds,
          },
        );
      }
    } else {
      // roleplay
      resultQuery = resultQuery.where(
        `(chat.volunteer.id = :userId OR chat.volunteer.id IS NULL OR chat.client.id = :userId)`,
        {
          userId: req.user.id,
        },
      );
    }

    resultQuery = resultQuery
      .andWhere("chat.chatType = :chatType", { chatType })
      .orderBy({
        "chat.lastMessageAt": "DESC",
        "messages.createdAt": "DESC",
      });

    return await resultQuery.getMany();
  }

  async getChatById(
    chatId: string,
    { dbConnection }: IGraphqlContext,
  ): Promise<Chat> {
    if (!chatId) {
      throw new UserInputError("Invalid chat id");
    }

    return await dbConnection
      .getRepository(Chat)
      .createQueryBuilder("chat")
      .where("chat.chatId = :chatId", { chatId: chatId })
      .leftJoinAndSelect("chat.client", "client")
      .leftJoinAndSelect("chat.volunteer", "volunteer")
      .leftJoinAndSelect("chat.messages", "messages")
      .leftJoinAndSelect("messages.sender", "sender")
      .orderBy({
        "chat.lastMessageAt": "DESC",
        "messages.createdAt": "DESC",
      })
      .getOneOrFail();
  }

  async getChatByIds(
    chatIds: string[],
    { dbConnection }: IGraphqlContext,
  ): Promise<Chat[]> {
    if (chatIds.length === 0) {
      return [];
    }

    return await dbConnection
      .getRepository(Chat)
      .createQueryBuilder("chat")
      .where("chat.chatId IN (:...chatIds)", { chatIds })
      .leftJoinAndSelect("chat.client", "client")
      .leftJoinAndSelect("chat.volunteer", "volunteer")
      .leftJoinAndSelect("chat.messages", "messages")
      .leftJoinAndSelect("messages.sender", "sender")
      .orderBy({
        "chat.lastMessageAt": "DESC",
        "messages.createdAt": "DESC",
      })
      .getMany();
  }

  @Query(() => Chat, { nullable: true })
  async getLastActiveChatOfClient(
    @Ctx() ctx: IGraphqlContext,
    chatType: EChatType,
  ): Promise<Chat | undefined> {
    if (!ctx.req.user) {
      throw new UnauthorizedError();
    }

    if (
      (chatType === EChatType.ROLEPLAY &&
        ctx.req.user.userRole !== EUserRole.VOLUNTEER) ||
      (chatType === EChatType.REGULAR &&
        ctx.req.user?.userRole !== EUserRole.CLIENT)
    ) {
      throw new UnauthorizedError();
    }

    // if the user is currently part of a chat and the chat's update time
    // is less than 60 minutes of current time, do not create a new Chat
    // and instead return the old chat object
    let query = ctx.dbConnection
      .getRepository(Chat)
      .createQueryBuilder("chat")
      .where("chat.clientId = :clientId", { clientId: ctx.req.user.id });

    if (chatType === EChatType.ROLEPLAY) {
      query = query.andWhere("chat.chatType = :chatType", { chatType });
    }

    query = query
      .leftJoinAndSelect("chat.client", "client")
      .leftJoinAndSelect("chat.volunteer", "volunteer")
      .leftJoinAndSelect("chat.messages", "messages")
      // TODO: add a clause where only messages sent in the last 20 minutes are visible
      .leftJoinAndSelect("messages.sender", "sender")
      .orderBy({
        "chat.lastMessageAt": "DESC",
        "messages.createdAt": "DESC",
      });

    const lastActiveChat = await query.getOne();

    if (lastActiveChat) {
      const threshold = 6 * 3600 * 1000; // 6 hours
      let lastHour = new Date(Date.now() - threshold);

      if (lastActiveChat.lastMessageAt > lastHour) {
        // this is a valid chat and the user should continue chatting here
        return lastActiveChat;
      }
    }

    return undefined;
  }

  @Mutation(() => Chat)
  async newChat(
    @Arg("chatType") chatType: EChatType,
    @Ctx() ctx: IGraphqlContext,
  ): Promise<Chat> {
    const lastActiveChat = await this.getLastActiveChatOfClient(ctx, chatType);

    if (lastActiveChat) {
      return lastActiveChat;
    }

    // otherwise, just create a new chat
    const newChat = Chat.create();
    newChat.client = ctx.req.user!;
    newChat.chatType = chatType;
    await newChat.save();

    await Message.create({
      chat: newChat,
      content: "Hey there, I need someone to talk to.",
      sender: ctx.req.user,
      type: EMessageType.CLIENT_TO_VOLUNTEER,
    }).save();

    const newChatWithMessages = await this.getChatById(newChat.chatId, ctx);
    await ctx.pubsub.publish(
      SubscriptionEvents.NEW_CHAT_CREATED,
      newChatWithMessages,
    );

    return newChatWithMessages;
  }

  @Mutation(() => Message)
  async newMessage(
    @Arg("message") message: MessageInput,
    @Ctx() { req, pubsub }: IGraphqlContext,
  ): Promise<Message> {
    let start = performance.now();

    // req.user is the sender
    if (!req.user) {
      throw new AuthenticationError("User is not logged in");
    }

    const { content, chatId, type } = message;
    const chat = await Chat.findOne(chatId, {
      relations: ["client", "volunteer", "messages", "messages.sender"],
    });

    console.log("Found chat from db: ", performance.now() - start, " ms");
    start = performance.now();

    if (!chat) {
      throw new ApolloError("Some error occured, please try again");
    }

    const newMessageObj = Message.create({
      chat: chat,
      content,
      type,
      sender: req.user,
    });

    await newMessageObj.save();

    console.log("Saved chat: ", performance.now() - start, " ms");
    start = performance.now();

    await pubsub.publish(SubscriptionEvents.NEW_MESSAGE, newMessageObj);

    console.log("Published message: ", performance.now() - start, " ms");

    return newMessageObj;
  }

  @Mutation(() => String)
  async markMessagesAsSeen(
    @Arg("chatId") chatId: string,
    @Ctx() { req }: IGraphqlContext,
  ): Promise<string> {
    if (!req.user) {
      throw new AuthenticationError("User is not logged in");
    }

    if (!chatId) {
      throw new UserInputError("Invalid message request ID");
    }

    if (
      req.user.userRole !== EUserRole.VOLUNTEER &&
      req.user.userRole !== EUserRole.CLIENT
    ) {
      throw new UnauthorizedError();
    }

    const chat = await Chat.findOneOrFail(chatId, {
      relations: ["client", "volunteer"],
    });

    // if the currently logged in user is not part of the chat, ignore
    if (chat.client.id !== req.user.id && chat.volunteer?.id !== req.user.id) {
      throw new UnauthorizedError();
    }

    // need to figure out which messages to update as seen
    let sender;

    if (chat.client.id === req.user.id) {
      // if the client id matches with current logged in user
      // he has seen the messages of the volunteer
      sender = chat.volunteer;
    } else {
      // else, it is the volunteer who has seen the client's message(s)
      sender = chat.client;
    }

    // find the messages from this chat that are unseen and
    // were not sent by the current logged in user
    await Message.update(
      {
        chat: chat,
        isSeen: false,
        sender: sender,
      },
      {
        isSeen: true,
      },
    );

    return chatId;
  }

  @Mutation(() => Chat)
  async acceptChatRequest(
    @Arg("chatId") chatId: string,
    @Ctx() { req, pubsub, ...rest }: IGraphqlContext,
  ): Promise<Chat> {
    if (!req.user) {
      throw new AuthenticationError("User is not logged in");
    }

    if (!chatId) {
      throw new UserInputError("Invalid message request ID");
    }

    const chatToSearchFor = await Chat.findOneOrFail(chatId, {
      relations: ["volunteer"],
    });

    if (!chatToSearchFor) {
      throw new UserInputError(
        "No valid messages found for the given message request ID",
      );
    }

    if (chatToSearchFor.volunteer) {
      throw new ApolloError(
        "The specified chat has already been accepted by another volunteer",
      );
    }

    chatToSearchFor.volunteer = req.user;
    await chatToSearchFor.save();

    // let the user know that someone accepted their chat request
    await pubsub.publish(
      SubscriptionEvents.CHAT_REQUEST_ACCEPTED,
      chatToSearchFor,
    );

    return await this.getChatById(chatId, { req, pubsub, ...rest });
  }

  /**
   * Let a volunteer sign off from a single chat
   */
  @Mutation(() => Boolean)
  async signOffOfChats(
    @Arg("chatSignOffInput") { chatIds }: ChatSignOffInput,
    @Ctx() { req, dbConnection, pubsub, ...rest }: IGraphqlContext,
  ) {
    if (!Array.isArray(chatIds) || chatIds.length === 0) {
      throw new UserInputError("Missing chatId(s)");
    }

    if (!(req.user?.userRole === EUserRole.VOLUNTEER)) {
      throw new UnauthorizedError();
    }

    const chats = await dbConnection
      .getRepository(Chat)
      .createQueryBuilder("chat")
      .where("chat.chatId IN (:...chatIds)", { chatIds })
      .andWhere(
        "(chat.volunteer.id = :volunteerId OR chat.client.id = :volunteerId)",
        {
          volunteerId: req.user?.id,
        },
      )
      .leftJoinAndSelect("chat.volunteer", "volunteer")
      .getMany();

    // everything checks out, sign off the volunteer from the given chat(s)
    for (let index = 0; index < chats.length; index++) {
      if (chats[index].chatType === EChatType.ROLEPLAY) {
        // no need to process such chats
        continue;

        // need to check whom to sign off
        // if (chats[index]?.client?.id === req.user?.id) {
        //   // @ts-ignore
        //   chats[index].client = null;
        //   await chats[index].save();
        // } else if (chats[index]?.volunteer?.id === req.user?.id) {
        //   // @ts-ignore
        //   chats[index].volunteer = null;
        //   await chats[index].save();
        // }
      } else {
        // @ts-ignore
        chats[index].volunteer = null;
        await chats[index].save();
      }
    }

    const chatsAfterSignOff = await this.getChatByIds(chatIds, {
      req,
      dbConnection,
      pubsub,
      ...rest,
    });

    chatsAfterSignOff.forEach(
      async (chat) =>
        await pubsub.publish(SubscriptionEvents.NEW_CHAT_CREATED, chat),
    );

    return true;
  }
}
