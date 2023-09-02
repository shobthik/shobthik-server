import { IAppointment } from "../../entities/therapy/Appointment";
import { Field, InputType } from "type-graphql";

@InputType()
export default class AppointmentCreateInput implements Partial<IAppointment> {
  @Field()
  clientId: string;

  @Field()
  transactionId: string;

  @Field(() => [Date])
  possibleDates: Date[];
}
