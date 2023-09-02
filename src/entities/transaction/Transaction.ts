import { Authorized, Field, ObjectType, registerEnumType } from "type-graphql";
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
import { Appointment } from "../therapy/Appointment";
import User, { EUserRole } from "../user/User";

export enum ETransactionStatus {
  APPROVED = "approved",
  DENIED = "denied",
  PROCESSING = "processing",
}

registerEnumType(ETransactionStatus, {
  name: "ETransactionStatus",
  description: "The currect status of the transaction",
});

export interface ITransaction {
  id: string;
  client: User;
  bkashTransactionId: string;
  transactionAmount: number;
  targetTherapist: User;
  lastFourDigitsOfNumber: string;
  status: ETransactionStatus;
  createdAt: Date;
  updatedAt: Date;
  specialNotes: string;
  remarksByAdmin: string;
}

@ObjectType()
@Entity()
export class Transaction implements ITransaction {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @Authorized([EUserRole.ADMIN, EUserRole.THERAPIST, EUserRole.CLIENT])
  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @Field(() => User, { nullable: true }) // can be null if client is deleted
  client: User;

  @Authorized([EUserRole.ADMIN, EUserRole.THERAPIST, EUserRole.CLIENT])
  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @Field(() => User, { nullable: true }) // can be null if therapist is deleted
  targetTherapist: User;

  @Authorized([EUserRole.ADMIN, EUserRole.CLIENT])
  @Field()
  @Column({ unique: true })
  bkashTransactionId: string;

  @Authorized([EUserRole.ADMIN, EUserRole.CLIENT])
  @Field()
  @Column()
  transactionAmount: number;

  @Authorized([EUserRole.ADMIN, EUserRole.CLIENT])
  @Field(() => ETransactionStatus)
  @Column({
    type: "enum",
    enum: ETransactionStatus,
    default: ETransactionStatus.PROCESSING,
  })
  status: ETransactionStatus;

  @Authorized([EUserRole.ADMIN, EUserRole.CLIENT])
  @Field()
  @Column()
  lastFourDigitsOfNumber: string;

  @Authorized([EUserRole.ADMIN, EUserRole.THERAPIST, EUserRole.CLIENT])
  @Field({ nullable: true })
  @Column({ nullable: true })
  specialNotes: string;

  @Authorized([EUserRole.ADMIN, EUserRole.THERAPIST, EUserRole.CLIENT])
  @Field(() => Appointment, { nullable: true })
  @OneToOne(() => Appointment, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn()
  appointment: Appointment;

  @Authorized([EUserRole.ADMIN, EUserRole.THERAPIST, EUserRole.CLIENT])
  @Field()
  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt: Date;

  @Authorized([EUserRole.ADMIN, EUserRole.THERAPIST, EUserRole.CLIENT])
  @Field()
  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt: Date;

  @Authorized([EUserRole.ADMIN, EUserRole.CLIENT])
  @Field({ nullable: true })
  @Column({ nullable: true })
  remarksByAdmin: string;
}
