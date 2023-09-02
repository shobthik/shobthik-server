import { Field, InputType } from "type-graphql";
import { EGender } from "../../types/types";
import EducationInput from "./EducationInput";
import ExperienceInput from "./ExperienceInput";

@InputType()
export default class VolunteerProfileInput {
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
}
