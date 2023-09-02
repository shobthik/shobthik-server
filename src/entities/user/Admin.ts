import { EUserRole } from "../../entities/user/User";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";
import { hash } from "bcrypt";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity({ name: "admins" })
export default class Admin extends BaseEntity {
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const hashedPassword = await hash(this.password, 10);
      this.password = hashedPassword;
    }
  }

  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Field()
  @Column({
    name: "user_role",
    type: "enum",
    enum: EUserRole,
    default: EUserRole.ADMIN,
  })
  userRole: EUserRole;

  @Field()
  @CreateDateColumn({
    type: "timestamp with time zone",
    nullable: false,
    name: "created_at",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamp with time zone",
    nullable: false,
    name: "updated_at",
  })
  updatedAt: Date;
}
