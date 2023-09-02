import { Field, ObjectType } from "type-graphql";
import { GraphQLJSONObject } from "graphql-type-json";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import BaseUserProfile from "./BaseUserProfile";
import { TPaymentAccountInformation } from "../../types/types";

@Entity({ name: "therapist_profiles" })
@ObjectType()
export default class TherapistProfile extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => BaseUserProfile, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn()
  @Field(() => BaseUserProfile)
  baseUserProfile: BaseUserProfile;

  @Field()
  @Column("text")
  specialization: string;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  description: string;

  @Field()
  @Column()
  profilePhotoUrl: string;

  @Field()
  @Column()
  certificationPhotoUrl: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column("jsonb", { nullable: true })
  paymentAccountInformation: TPaymentAccountInformation;
}
