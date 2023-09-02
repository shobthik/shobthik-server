import { Authorized, Field, ObjectType } from "type-graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Transaction } from "../transaction/Transaction";
import User, { EUserRole } from "../user/User";

export interface IAppointment {
  id: string;
  client: User;
  therapist: User;
  possibleDates: Date[];
  decidedDate: Date;
  meetLink: string;
  transaction: Transaction;
  resolved: boolean;
}

@ObjectType()
@Entity()
export class Appointment implements IAppointment {
  @Authorized([EUserRole.ADMIN, EUserRole.CLIENT, EUserRole.THERAPIST])
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Authorized([EUserRole.ADMIN, EUserRole.CLIENT, EUserRole.THERAPIST])
  @Field(() => User)
  @ManyToOne(() => User, { onDelete: "SET NULL" })
  client: User;

  @Authorized([EUserRole.ADMIN, EUserRole.CLIENT, EUserRole.THERAPIST])
  @Field(() => User)
  @ManyToOne(() => User, { onDelete: "SET NULL" })
  therapist: User;

  @Authorized([EUserRole.ADMIN, EUserRole.CLIENT, EUserRole.THERAPIST])
  @Field(() => [Date])
  @Column("jsonb")
  possibleDates: Date[];

  @Authorized([EUserRole.ADMIN, EUserRole.CLIENT, EUserRole.THERAPIST])
  @Field({ nullable: true })
  @Column("timestamp with time zone", { nullable: true })
  decidedDate: Date;

  @Authorized([EUserRole.ADMIN, EUserRole.CLIENT, EUserRole.THERAPIST])
  @Field({ nullable: true })
  @Column({ nullable: true })
  meetLink: string;

  @Authorized([EUserRole.ADMIN, EUserRole.CLIENT])
  @Field(() => Transaction)
  @OneToOne(() => Transaction, { onDelete: "CASCADE" })
  @JoinColumn()
  transaction: Transaction; // for which transaction

  @Authorized([EUserRole.ADMIN, EUserRole.CLIENT, EUserRole.THERAPIST])
  @Field()
  @Column({ default: false })
  resolved: boolean;

  @Authorized([EUserRole.ADMIN, EUserRole.CLIENT, EUserRole.THERAPIST])
  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Authorized([EUserRole.ADMIN, EUserRole.CLIENT, EUserRole.THERAPIST])
  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
