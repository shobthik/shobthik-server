import { EChatType } from "../../types/types";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import Message from "../message/Message";
import User from "../user/User";

// this object should be created when a volunteer accepts a message request from a client

registerEnumType(EChatType, {
  name: "EChatType",
  description: "The type of the chat: Roleplay or Regular",
});

@Entity()
@ObjectType()
export default class Chat extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  chatId: string;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @Field(() => User)
  client: User;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @Field(() => User, { nullable: true })
  volunteer?: User;

  @OneToMany(() => Message, (message) => message.chat)
  @Field(() => [Message])
  messages: Message[];

  @Field()
  @CreateDateColumn({
    type: "timestamp with time zone",
    nullable: false,
  })
  createdAt: Date;

  @Field()
  @Column({
    type: "timestamp with time zone",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  lastMessageAt: Date;

  @Field(() => EChatType)
  @Column("enum", { enum: EChatType, default: EChatType.REGULAR })
  chatType: EChatType;
}
