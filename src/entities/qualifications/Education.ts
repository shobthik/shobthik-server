import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import BaseUserProfile from "../user/BaseUserProfile";

@Entity()
@ObjectType()
export default class Education extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  institutionName: string;

  @Field({ nullable: true })
  @Column("timestamp with time zone")
  from: Date;

  @Field({ nullable: true })
  @Column("timestamp with time zone", { nullable: true })
  to?: Date;

  @Field(() => Boolean)
  @Column("boolean", { default: false })
  currentlyEnrolledHere: boolean;

  @ManyToOne(() => BaseUserProfile, (profile) => profile.userId, {
    onDelete: "SET NULL",
  })
  user: BaseUserProfile;
}
