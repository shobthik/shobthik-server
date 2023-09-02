import { EMessageType } from "../../types/types";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import {
  AfterInsert,
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Chat from "../chat/Chat";
import User from "../user/User";

registerEnumType(EMessageType, {
  name: "EMessageType",
  description:
    "Type of the message, can also be interpreted as source to destination",
});

@Entity()
@ObjectType()
export default class Message extends BaseEntity {
  @AfterInsert()
  async updateChatLastMessageAtField() {
    const currentChat = await Chat.findOneOrFail({
      where: { chatId: this.chat.chatId },
    });
    currentChat.lastMessageAt = this.createdAt;
    await currentChat.save();
  }

  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  messageId: string;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @Field(() => User)
  sender: User;

  @Column()
  @Field()
  content: string;

  @Column({ type: "enum", enum: EMessageType, nullable: false })
  @Field(() => EMessageType)
  type: EMessageType;

  @CreateDateColumn({
    type: "timestamp with time zone",
    nullable: false,
  })
  @Field()
  createdAt: Date;

  @Column({ type: "boolean", default: false })
  @Field(() => Boolean)
  isSeen: boolean;

  @Field(() => Chat, { nullable: true })
  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;
}
