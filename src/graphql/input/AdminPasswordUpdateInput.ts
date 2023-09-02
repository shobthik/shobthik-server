import { Field, InputType } from "type-graphql";

@InputType()
export default class AdminPasswordUpdateInput {
  @Field()
  email: string;

  @Field()
  oldPassword: string;

  @Field()
  newPassword: string;

  @Field()
  newPasswordConfirmation: string;
}
