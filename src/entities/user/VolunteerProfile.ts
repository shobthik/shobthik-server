import { ObjectType } from "type-graphql";
import {
  BaseEntity,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import BaseUserProfile from "./BaseUserProfile";

@Entity({ name: "volunteer_profiles" })
@ObjectType()
export default class VolunteerProfile extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => BaseUserProfile, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn()
  baseUserProfile: BaseUserProfile;
}
