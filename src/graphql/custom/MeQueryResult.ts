import {
  EEmploymentStatus,
  EGender,
  EIssues,
  TPaymentAccountInformation,
} from "../../types/types";
import { Field, ID, ObjectType } from "type-graphql";
import Education from "../../entities/qualifications/Education";
import Experience from "../../entities/qualifications/Experience";
import { GraphQLJSONObject } from "graphql-type-json";
import { EUserRole } from "../../entities/user/User";

@ObjectType()
export default class ProfileQueryResult {
  @Field(() => ID)
  userId!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field()
  dateOfBirth!: Date;

  @Field()
  email!: string;

  @Field(() => EGender)
  gender!: EGender;

  @Field(() => EUserRole)
  userRole!: EUserRole;

  @Field(() => EEmploymentStatus, { nullable: true })
  currentEmploymentStatus?: EEmploymentStatus;

  @Field(() => EIssues, { nullable: true })
  primaryIssue?: EIssues;

  @Field(() => Boolean, { nullable: true })
  consultedPsychiatrist?: boolean;

  @Field(() => [Education], { nullable: true })
  education?: Education[];

  @Field(() => [Experience], { nullable: true })
  experience?: Experience[];

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  specialization?: string;

  @Field({ nullable: true })
  profilePhotoUrl?: string;

  @Field({ nullable: true })
  certificationPhotoUrl?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  paymentAccountInformation?: TPaymentAccountInformation;
}
