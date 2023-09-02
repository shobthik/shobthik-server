import { Field, InputType } from "type-graphql";

@InputType()
export default class ChatSignOffInput {
  @Field(() => [String])
  chatIds!: string[];
}
