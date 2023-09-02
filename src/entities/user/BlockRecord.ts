import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "./User";

@ObjectType()
@Entity()
export default class BlockRecord extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  blockRecordId: string;

  /**
   * Setting foreign key without relations workaround
   * https://github.com/typeorm/typeorm/issues/4569#issuecomment-825337586
   *
   * Basically, set up a ManyToOne relationship and declare a second column with the same name
   * as the column in the MTO relation
   */

  @Field()
  @Column()
  blockedByUserId: number;
  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ referencedColumnName: "id", name: "blockedByUserId" })
  _blockedByUser: User;

  @Field()
  @Column()
  blockedUserId: number;
  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ referencedColumnName: "id", name: "blockedUserId" })
  _blockedUser: User;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  static async getBlockRecordsForCurrentUser(currentLoggedInUserId: number) {
    const blockRecords = await BlockRecord.find({
      where: {
        blockedByUserId: currentLoggedInUserId,
      },
    });

    return blockRecords;
  }
}
