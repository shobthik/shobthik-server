import { Field, ObjectType, registerEnumType } from "type-graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "../user/User";
import { GraphQLJSONObject } from "graphql-type-json";

export enum ENotificationContext {
  TRANSACTION_APPROVED = "TRANSACTION_APPROVED",
  TRANSACTION_DECLINED = "TRANSACTION_DECLINED",
  THERAPY_APPOINTMENT_REQUEST = "THERAPY_APPOINTMENT_REQUEST",
  THERAPY_APPOINTMENT_CREATED = "THERAPY_APPOINTMENT_CREATED",
  THERAPY_APPOINTMENT_UPDATED = "THERAPY_APPOINTMENT_UPDATED",
  TRANSACTION_CREATED = "TRANSACTION_CREATED",
  ADMIN_ADDED = "ADMIN_ADDED",
}

registerEnumType(ENotificationContext, {
  name: "ENotificationContext",
  description: "The notification context descriptor",
});

export interface INotification {
  id: string;
  ctx: ENotificationContext;
  ctxObject: any;
  createdAt: Date;
  message: string;
  user: User;
  seen: boolean;
}

@ObjectType()
@Entity()
export class Notification implements INotification {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => GraphQLJSONObject)
  @Column("jsonb")
  ctxObject: any;

  @Field(() => ENotificationContext)
  @Column("enum", { enum: ENotificationContext })
  ctx: ENotificationContext;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @Column()
  message: string;

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: "SET NULL" })
  user: User;

  @Field()
  @Column("bool", { default: false })
  seen: boolean;
}
