import { Max, Min, MinLength } from "class-validator";
import { IAppointmentRating } from "../../entities/therapy/AppointmentRating";
import { Field, InputType } from "type-graphql";

@InputType()
export default class AppointmentRatingInput
  implements Partial<IAppointmentRating>
{
  @Field()
  appointmentId: string;

  @Field()
  @Min(0)
  @Max(10)
  rating: number;

  @Field({ nullable: true })
  @MinLength(150)
  remarks: string;
}
