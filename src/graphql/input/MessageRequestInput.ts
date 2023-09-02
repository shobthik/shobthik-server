import { Field, InputType } from "type-graphql";
import MessageInput from "./MessageInput";

@InputType()
export default class MessageRequestInput implements Partial<MessageInput> {
  @Field()
  content: string;
}
