import { Field, InputType } from "type-graphql";

@InputType()
export default class NotificationInput {
  @Field(() => [String])
  notificationIds: string[];
}
