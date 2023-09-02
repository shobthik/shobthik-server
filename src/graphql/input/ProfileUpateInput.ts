import { GraphQLJSONObject } from "graphql-type-json";
import { TPaymentAccountInformation } from "src/types/types";
import { Field, InputType } from "type-graphql";
import EducationInput from "./EducationInput";
import ExperienceInput from "./ExperienceInput";

// profile can only be updated by therapist or volunteer
// at a limited scale for security reasons
@InputType()
export default class ProfileUpdateInput {
  @Field(() => [EducationInput], { nullable: true })
  education: EducationInput[];

  @Field(() => [ExperienceInput], { nullable: true })
  experience: ExperienceInput[];

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  profilePhotoUrl: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  paymentAccountInformation: TPaymentAccountInformation;
}
