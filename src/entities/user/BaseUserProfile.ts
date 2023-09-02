import { EGender } from "../../types/types";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "./User";
import Experience from "../qualifications/Experience";
import Education from "../qualifications/Education";

registerEnumType(EGender, {
  name: "Gender",
  description: "The gender of the user",
});

@ObjectType()
@Entity()
export default class BaseUserProfile extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  userId: string;

  @Field()
  @Column()
  firstName!: string;

  @Field()
  @Column()
  lastName!: string;

  @Field()
  @Column({ type: "timestamp with time zone" })
  dateOfBirth!: Date;

  @Field(() => EGender)
  @Column({ enum: EGender, type: "enum" })
  gender!: EGender;

  @OneToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "userIdentifier" })
  user: User;

  @Field(() => [Experience], { nullable: true })
  @OneToMany(() => Experience, (exp) => exp.user, { nullable: true })
  experiences?: Experience[];

  @Field(() => [Education], { nullable: true })
  @OneToMany(() => Education, (education) => education.user, { nullable: true })
  education?: Education[];
}
