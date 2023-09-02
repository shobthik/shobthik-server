import { EUserRole } from "../../entities/user/User";
import { Field, InputType } from "type-graphql";

@InputType()
export default class UserRoleChangeInput {
  @Field()
  userId: string;

  @Field({ nullable: true })
  shouldApproveUser: boolean;

  @Field({ nullable: true })
  shouldBanUser: boolean;
}
