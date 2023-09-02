import { Field, ObjectType } from "type-graphql";
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Appointment } from "./Appointment";

export interface IAppointmentRating {
  id: string;
  appointment: Appointment;
  rating: number;
  remarks: string;
}

@ObjectType()
@Entity()
export class AppointmentRating implements IAppointmentRating {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => Appointment)
  @OneToOne(() => Appointment)
  @JoinColumn()
  appointment: Appointment;

  @Field()
  @Column({ scale: 0 })
  rating: number;

  @Field()
  @Column()
  remarks: string;
}
