import ChatReport from "../../entities/chat/ChatReport";
import { IGraphqlContext } from "src/types/types";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import ChatReportInput from "../input/ChatReportInput";
import { UserInputError } from "apollo-server-express";
import Chat from "../../entities/chat/Chat";

/**
 * The resolver for the chat report creation
 */
@Resolver()
export default class ChatReportResolver {
  @Mutation(() => ChatReport)
  async fileChatReport(
    @Arg("chatReportInput") { chatId, report }: ChatReportInput,
    @Ctx() { req }: IGraphqlContext,
  ): Promise<ChatReport> {
    if (!chatId || !report) {
      throw new UserInputError("All necessary fields not provided");
    }

    const chat = await Chat.findOneOrFail(chatId);

    // check if a report for the same chat already exists and is not resolved yet
    const chatReport = await ChatReport.findOne({
      relations: ["chat", "filedByUser"],
      where: {
        chat: chat,
        filedByUser: req.user?.id,
        resolved: false,
      },
    });

    if (!chatReport) {
      // proceed with the chat report creation
      const newChatReport = ChatReport.create({
        chat: chat,
        report,
        filedByUser: req.user,
      });

      return await newChatReport.save();
    } else {
      throw new UserInputError(
        "An unresolved chat report for the same chat already exists",
      );
    }
  }
}
