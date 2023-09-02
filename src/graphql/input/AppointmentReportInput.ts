import { MinLength } from "class-validator";
import { IAppointmentReport } from "../../entities/therapy/AppointmentReport";
import { Field, InputType } from "type-graphql";

@InputType()
export default class AppointmentReportInput
  implements Partial<IAppointmentReport>
{
  @Field()
  appointmentId: string;

  @Field()
  @MinLength(150)
  remarks: string;
}
