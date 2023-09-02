import { Field, ID, InputType } from "type-graphql";
import ChatReport from "../../entities/chat/ChatReport";

/**
 * The Grqphql input type for ChatReport
 */
@InputType()
export default class ChatReportInput implements Partial<ChatReport> {
  @Field(() => ID)
  chatId: string;

  @Field()
  report: string;
}
