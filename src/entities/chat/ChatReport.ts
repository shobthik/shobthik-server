import Chat from "../chat/Chat";
import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "../user/User";

/**
 * A chat report is when a user files a report against a particular chat instance
 * for review, which can be used to verify and possibly ban a user/volunteer
 */
@Entity()
@ObjectType()
export default class ChatReport extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  reportId!: string;

  @OneToOne(() => Chat, { nullable: false })
  @JoinColumn({ name: "chatId" })
  @Field(() => Chat)
  chat!: Chat;

  @Column("text")
  @Field()
  report!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: "SET NULL" })
  @JoinColumn({ name: "filedByUser" })
  @Field(() => User)
  filedByUser!: User;

  @CreateDateColumn()
  @Field()
  createdAt!: Date;

  @Column({ type: "boolean", default: false })
  @Field(() => Boolean)
  resolved!: boolean;
}
