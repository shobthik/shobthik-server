import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "../user/User";

@ObjectType()
@Entity()
export default class MessageRequest extends BaseEntity {
  // a message request has a sender and content, but no receiver, since it will be broadcasted
  // to every single volunteer currently enrolled into the system
  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  messageRequestId: string;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @Field(() => ID)
  clientId: User;

  @Column()
  @Field()
  content: string;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @Field(() => ID)
  acceptedBy?: User; // the id of the volunteer who accepted the request
}
