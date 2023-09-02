import { GraphQLJSONObject } from "graphql-type-json";
import { Field, InputType } from "type-graphql";
import { EGender, TPaymentAccountInformation } from "../../types/types";
import EducationInput from "./EducationInput";
import ExperienceInput from "./ExperienceInput";

@InputType()
export default class TherapistProfileInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  dateOfBirth: Date;

  @Field(() => EGender)
  gender: EGender;

  @Field(() => [EducationInput])
  education: EducationInput[];

  @Field(() => [ExperienceInput])
  experience: ExperienceInput[];

  @Field()
  specialization: string;

  @Field()
  description: string;

  @Field()
  profilePhotoUrl: string;

  @Field()
  certificationPhotoUrl: string;

  @Field(() => GraphQLJSONObject)
  paymentAccountInformation: TPaymentAccountInformation;
}
