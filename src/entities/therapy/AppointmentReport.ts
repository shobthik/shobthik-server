import { Field, ObjectType } from "type-graphql";
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Appointment } from "./Appointment";

// only by therapist
export interface IAppointmentReport {
  id: string;
  appointment: Appointment;
  remarks: string;
}

@ObjectType()
@Entity()
export class AppointmentReport implements IAppointmentReport {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => Appointment)
  @OneToOne(() => Appointment)
  @JoinColumn()
  appointment: Appointment;

  @Field()
  @Column()
  remarks: string;
}
