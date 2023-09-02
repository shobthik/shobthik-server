import { Field, InputType } from "type-graphql";
import { IAppointment } from "../../entities/therapy/Appointment";

@InputType()
export default class AppointmentUpdateInput implements Partial<IAppointment> {
  @Field()
  id: string;

  @Field(() => Date, { nullable: true })
  decidedDate?: Date;

  @Field(() => [Date], { nullable: true })
  possibleDates?: Date[];

  @Field({ nullable: true })
  meetLink?: string;

  @Field(() => Boolean, { defaultValue: false })
  resolved: boolean;
}
