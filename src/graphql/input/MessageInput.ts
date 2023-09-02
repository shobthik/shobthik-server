import User from "../../entities/user/User";
import { Field, ID, InputType } from "type-graphql";
import Message from "../../entities/message/Message";
import { EMessageType } from "../../types/types";

@InputType()
export default class MessageInput implements Partial<Message> {
  @Field(() => ID)
  chatId: string;

  @Field(() => EMessageType)
  type: EMessageType;

  @Field(() => String)
  content: string;
}
