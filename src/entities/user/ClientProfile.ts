import { EEmploymentStatus, EIssues } from "../../types/types";
import { Field, ObjectType, registerEnumType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import BaseUserProfile from "./BaseUserProfile";

registerEnumType(EEmploymentStatus, {
  name: "EmploymentStatus",
  description: "The current employment status of the user",
});

registerEnumType(EIssues, {
  name: "PrimaryIssue",
  description: "The current primary issue of the user",
});

@ObjectType()
@Entity({ name: "client_profiles" })
export class ClientProfile extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => BaseUserProfile, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn()
  baseUserProfile: BaseUserProfile;

  @Field(() => EEmploymentStatus)
  @Column("enum", { enum: EEmploymentStatus })
  currentEmploymentStatus: EEmploymentStatus;

  @Field(() => EIssues)
  @Column("enum", { enum: EIssues })
  primaryIssue: EIssues;

  @Field(() => Boolean)
  @Column()
  consultedPsychiatrist: boolean;
}
