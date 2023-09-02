import { ObjectType, Field, ID } from "type-graphql";
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from "typeorm";
import BaseUserProfile from "../user/BaseUserProfile";

@Entity()
@ObjectType()
export default class Experience extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  description: string;

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
  currentlyWorkingHere: boolean;

  @ManyToOne(() => BaseUserProfile, (profile) => profile.userId, {
    onDelete: "SET NULL",
  })
  user: BaseUserProfile;
}
