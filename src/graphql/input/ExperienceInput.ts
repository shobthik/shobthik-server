import { Field, InputType } from "type-graphql";
import Experience from "../../entities/qualifications/Experience";

@InputType()
export default class ExperienceInput implements Partial<Experience> {
  @Field({ nullable: true })
  id?: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  institutionName: string;

  @Field()
  from: Date;

  @Field({ nullable: true })
  to?: Date;

  @Field()
  currentlyWorkingHere: boolean;
}
