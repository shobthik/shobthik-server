import { Field, InputType } from "type-graphql";
import Education from "../../entities/qualifications/Education";

@InputType()
export default class EducationInput implements Partial<Education> {
  @Field({ nullable: true })
  id?: string;

  @Field()
  title: string;

  @Field()
  institutionName: string;

  @Field()
  from: Date;

  @Field({ nullable: true })
  to?: Date;

  @Field()
  currentlyEnrolledHere: boolean;
}
