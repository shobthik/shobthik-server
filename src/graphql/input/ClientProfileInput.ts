import { ClientProfile } from "../../entities/user/ClientProfile";
import { Field, InputType } from "type-graphql";
import { EGender, EEmploymentStatus, EIssues } from "../../types/types";

@InputType()
export default class ClientProfileInput implements Partial<ClientProfile> {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  dateOfBirth: Date;

  @Field(() => EGender)
  gender: EGender;

  @Field(() => EEmploymentStatus)
  currentEmploymentStatus: EEmploymentStatus;

  @Field(() => EIssues)
  primaryIssue: EIssues;

  @Field(() => Boolean)
  consultedPsychiatrist: boolean;
}
