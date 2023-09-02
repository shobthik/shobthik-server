import { Authorized, Field, ObjectType, registerEnumType } from "type-graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum EUserRole {
  ADMIN = "admin",
  CLIENT = "client",
  THERAPIST = "therapist",
  VOLUNTEER = "volunteer",
  NEW_USER = "new_user",
}

registerEnumType(EUserRole, {
  name: "EUserRole",
  description: "The roles of the users in the website",
});

// every column must be named in snake case for next auth typeorm adapter to work properly

@ObjectType()
@Entity({ name: "users" })
export default class User {
  @Field(() => String)
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Authorized([EUserRole.ADMIN, EUserRole.THERAPIST])
  @Field({ nullable: true })
  @Column()
  name: string;

  @Authorized([EUserRole.ADMIN, EUserRole.THERAPIST])
  @Field()
  @Column({ unique: true })
  email: string;

  @Column("timestamp with time zone", {
    name: "email_verified",
    nullable: true,
  })
  emailVerified: Date;

  @Field({ nullable: true })
  @Column()
  image: string;

  @Field()
  @CreateDateColumn({
    type: "timestamp with time zone",
    nullable: false,
    name: "created_at",
  })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({
    type: "timestamp with time zone",
    nullable: false,
    name: "updated_at",
  })
  updatedAt: Date;

  @Authorized([EUserRole.ADMIN])
  @Field({ nullable: true })
  @Column("bool", { default: true, name: "is_new_user" })
  isNewUser: boolean;

  @Authorized([EUserRole.ADMIN])
  @Field({ nullable: true })
  @Column("bool", { default: false, name: "is_approved" })
  isApproved: boolean;

  @Authorized([EUserRole.ADMIN])
  @Field({ nullable: true })
  @Column("bool", { default: false, name: "is_banned" })
  isBanned: boolean;

  @Field()
  @Column("enum", {
    enum: EUserRole,
    default: EUserRole.NEW_USER,
    name: "user_role",
  })
  userRole: EUserRole;
}
