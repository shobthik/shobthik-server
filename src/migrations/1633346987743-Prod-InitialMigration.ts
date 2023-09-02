import {MigrationInterface, QueryRunner} from "typeorm";

export class ProdInitialMigration1633346987743 implements MigrationInterface {
    name = 'ProdInitialMigration1633346987743'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "users_user_role_enum" AS ENUM('admin', 'client', 'psychiatrist', 'volunteer', 'new_user')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "email_verified" TIMESTAMP WITH TIME ZONE, "image" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_new_user" boolean NOT NULL DEFAULT true, "is_approved" boolean NOT NULL DEFAULT false, "is_banned" boolean NOT NULL DEFAULT false, "user_role" "users_user_role_enum" NOT NULL DEFAULT 'new_user', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "message_type_enum" AS ENUM('CLIENT_TO_VOLUNTEER', 'VOLUNTEER_TO_CLIENT')`);
        await queryRunner.query(`CREATE TABLE "message" ("messageId" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "type" "message_type_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isSeen" boolean NOT NULL DEFAULT false, "senderId" integer, "chatChatId" uuid, CONSTRAINT "PK_b664c8ae63d634326ce5896cecc" PRIMARY KEY ("messageId"))`);
        await queryRunner.query(`CREATE TYPE "chat_chattype_enum" AS ENUM('regular', 'roleplay')`);
        await queryRunner.query(`CREATE TABLE "chat" ("chatId" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastMessageAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "chatType" "chat_chattype_enum" NOT NULL DEFAULT 'regular', "clientId" integer, "volunteerId" integer, CONSTRAINT "PK_3af41a2b44ec75589b7213a05e2" PRIMARY KEY ("chatId"))`);
        await queryRunner.query(`CREATE TABLE "chat_report" ("reportId" uuid NOT NULL DEFAULT uuid_generate_v4(), "report" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "resolved" boolean NOT NULL DEFAULT false, "chatId" uuid NOT NULL, "filedByUser" integer NOT NULL, CONSTRAINT "REL_1fc2ff6de4399d3c8c8d52440f" UNIQUE ("chatId"), CONSTRAINT "PK_09ecf990eb682ff4c2ff7d11a9a" PRIMARY KEY ("reportId"))`);
        await queryRunner.query(`CREATE TABLE "experience" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying NOT NULL, "institutionName" character varying NOT NULL, "from" TIMESTAMP WITH TIME ZONE NOT NULL, "to" TIMESTAMP WITH TIME ZONE, "currentlyWorkingHere" boolean NOT NULL DEFAULT false, "userUserId" uuid, CONSTRAINT "PK_5e8d5a534100e1b17ee2efa429a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "base_user_profile_gender_enum" AS ENUM('MALE', 'FEMALE', 'NON_BINARY')`);
        await queryRunner.query(`CREATE TABLE "base_user_profile" ("userId" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "dateOfBirth" TIMESTAMP WITH TIME ZONE NOT NULL, "gender" "base_user_profile_gender_enum" NOT NULL, "userIdentifier" integer NOT NULL, CONSTRAINT "REL_b1c47caae2070346a412a65c2a" UNIQUE ("userIdentifier"), CONSTRAINT "PK_07f8ea13fa065442463c6440643" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "education" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "institutionName" character varying NOT NULL, "from" TIMESTAMP WITH TIME ZONE NOT NULL, "to" TIMESTAMP WITH TIME ZONE, "currentlyEnrolledHere" boolean NOT NULL DEFAULT false, "userUserId" uuid, CONSTRAINT "PK_bf3d38701b3030a8ad634d43bd6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "transaction_status_enum" AS ENUM('approved', 'denied', 'processing')`);
        await queryRunner.query(`CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bkashTransactionId" character varying NOT NULL, "transactionAmount" integer NOT NULL, "status" "transaction_status_enum" NOT NULL DEFAULT 'processing', "lastFourDigitsOfNumber" character varying NOT NULL, "specialNotes" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "remarksByAdmin" character varying, "clientId" integer, "targetTherapistId" integer, "appointmentId" uuid, CONSTRAINT "UQ_ea7fef64e8e9c24780f7faf33c0" UNIQUE ("bkashTransactionId"), CONSTRAINT "REL_ccb316b4b0cc69c9f479af7cf0" UNIQUE ("appointmentId"), CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "appointment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "possibleDates" jsonb NOT NULL, "decidedDate" TIMESTAMP WITH TIME ZONE, "meetLink" character varying, "resolved" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "clientId" integer, "therapistId" integer, "transactionId" uuid, CONSTRAINT "REL_26ef4752cb6dd71cd5a1e264e8" UNIQUE ("transactionId"), CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "appointment_rating" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rating" integer NOT NULL, "remarks" character varying NOT NULL, "appointmentId" uuid, CONSTRAINT "REL_0097a7b26a8dd4e1f2c6205c6d" UNIQUE ("appointmentId"), CONSTRAINT "PK_0b2238f0e3f021790b3fd3ddc69" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "appointment_report" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "remarks" character varying NOT NULL, "appointmentId" uuid, CONSTRAINT "REL_037bbcce9ce99d7155f2ee8381" UNIQUE ("appointmentId"), CONSTRAINT "PK_dee7a9cdbbe8c4a9e2781c78286" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "admins_user_role_enum" AS ENUM('admin', 'client', 'psychiatrist', 'volunteer', 'new_user')`);
        await queryRunner.query(`CREATE TABLE "admins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "user_role" "admins_user_role_enum" NOT NULL DEFAULT 'admin', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_051db7d37d478a69a7432df1479" UNIQUE ("email"), CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "block_record" ("blockRecordId" uuid NOT NULL DEFAULT uuid_generate_v4(), "blockedByUserId" integer NOT NULL, "blockedUserId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9c532e5e048e3cce8f320d20b2f" PRIMARY KEY ("blockRecordId"))`);
        await queryRunner.query(`CREATE TYPE "client_profiles_currentemploymentstatus_enum" AS ENUM('STUDENT', 'EMPLOYED', 'UNEMPLOYED')`);
        await queryRunner.query(`CREATE TYPE "client_profiles_primaryissue_enum" AS ENUM('LOVE', 'WORK', 'FRIENDS', 'OTHERS')`);
        await queryRunner.query(`CREATE TABLE "client_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "currentEmploymentStatus" "client_profiles_currentemploymentstatus_enum" NOT NULL, "primaryIssue" "client_profiles_primaryissue_enum" NOT NULL, "consultedPsychiatrist" boolean NOT NULL, "baseUserProfileUserId" uuid NOT NULL, CONSTRAINT "REL_00a2abab138fe280e6ba8e4fde" UNIQUE ("baseUserProfileUserId"), CONSTRAINT "PK_fc4acd4b04f4a0537e7213f8ddd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "therapist_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "specialization" text NOT NULL, "description" text, "profilePhotoUrl" character varying NOT NULL, "certificationPhotoUrl" character varying NOT NULL, "baseUserProfileUserId" uuid NOT NULL, CONSTRAINT "REL_3d8ca197165bf1b4af300d0e37" UNIQUE ("baseUserProfileUserId"), CONSTRAINT "PK_f797abb29d988b98c28b933949b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "volunteer_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "baseUserProfileUserId" uuid NOT NULL, CONSTRAINT "REL_a90c210f4a120c40ef376850a1" UNIQUE ("baseUserProfileUserId"), CONSTRAINT "PK_01b274d2ec8a3a044a54819ef6f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "notification_ctx_enum" AS ENUM('TRANSACTION_APPROVED', 'TRANSACTION_DECLINED', 'THERAPY_APPOINTMENT_REQUEST', 'THERAPY_APPOINTMENT_CREATED', 'THERAPY_APPOINTMENT_UPDATED')`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ctxObject" jsonb NOT NULL, "ctx" "notification_ctx_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "message" character varying NOT NULL, "seen" boolean NOT NULL DEFAULT false, "userId" integer, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_1a862ba2b3ceb14f888fbb9ceb6" FOREIGN KEY ("chatChatId") REFERENCES "chat"("chatId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_6dba494433f6420f81d19fa6de4" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_e9835cd92ac9e719d6f55e3e9e3" FOREIGN KEY ("volunteerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_report" ADD CONSTRAINT "FK_1fc2ff6de4399d3c8c8d52440f8" FOREIGN KEY ("chatId") REFERENCES "chat"("chatId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_report" ADD CONSTRAINT "FK_8268e2a31f4ce31a470f57d266e" FOREIGN KEY ("filedByUser") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "experience" ADD CONSTRAINT "FK_57e06092cab2338fa6a337669aa" FOREIGN KEY ("userUserId") REFERENCES "base_user_profile"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "base_user_profile" ADD CONSTRAINT "FK_b1c47caae2070346a412a65c2a7" FOREIGN KEY ("userIdentifier") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "education" ADD CONSTRAINT "FK_21ef90f3be023b54744c2637589" FOREIGN KEY ("userUserId") REFERENCES "base_user_profile"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_b01db6b3e203945a6bd5fc5797b" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_6dc0b41cd3de330873a1686653d" FOREIGN KEY ("targetTherapistId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_ccb316b4b0cc69c9f479af7cf0a" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_60ac979e3cb15127f2221e3b66d" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_15d2701bb83b7aef5fdfef379d5" FOREIGN KEY ("therapistId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_26ef4752cb6dd71cd5a1e264e8f" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment_rating" ADD CONSTRAINT "FK_0097a7b26a8dd4e1f2c6205c6d7" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment_report" ADD CONSTRAINT "FK_037bbcce9ce99d7155f2ee8381e" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "block_record" ADD CONSTRAINT "FK_ad01abb61813359520291de7903" FOREIGN KEY ("blockedByUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "block_record" ADD CONSTRAINT "FK_68f987e1bd9460387000264437b" FOREIGN KEY ("blockedUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client_profiles" ADD CONSTRAINT "FK_00a2abab138fe280e6ba8e4fde7" FOREIGN KEY ("baseUserProfileUserId") REFERENCES "base_user_profile"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "therapist_profiles" ADD CONSTRAINT "FK_3d8ca197165bf1b4af300d0e379" FOREIGN KEY ("baseUserProfileUserId") REFERENCES "base_user_profile"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "volunteer_profiles" ADD CONSTRAINT "FK_a90c210f4a120c40ef376850a11" FOREIGN KEY ("baseUserProfileUserId") REFERENCES "base_user_profile"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`);
        await queryRunner.query(`ALTER TABLE "volunteer_profiles" DROP CONSTRAINT "FK_a90c210f4a120c40ef376850a11"`);
        await queryRunner.query(`ALTER TABLE "therapist_profiles" DROP CONSTRAINT "FK_3d8ca197165bf1b4af300d0e379"`);
        await queryRunner.query(`ALTER TABLE "client_profiles" DROP CONSTRAINT "FK_00a2abab138fe280e6ba8e4fde7"`);
        await queryRunner.query(`ALTER TABLE "block_record" DROP CONSTRAINT "FK_68f987e1bd9460387000264437b"`);
        await queryRunner.query(`ALTER TABLE "block_record" DROP CONSTRAINT "FK_ad01abb61813359520291de7903"`);
        await queryRunner.query(`ALTER TABLE "appointment_report" DROP CONSTRAINT "FK_037bbcce9ce99d7155f2ee8381e"`);
        await queryRunner.query(`ALTER TABLE "appointment_rating" DROP CONSTRAINT "FK_0097a7b26a8dd4e1f2c6205c6d7"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_26ef4752cb6dd71cd5a1e264e8f"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_15d2701bb83b7aef5fdfef379d5"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_60ac979e3cb15127f2221e3b66d"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_ccb316b4b0cc69c9f479af7cf0a"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_6dc0b41cd3de330873a1686653d"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_b01db6b3e203945a6bd5fc5797b"`);
        await queryRunner.query(`ALTER TABLE "education" DROP CONSTRAINT "FK_21ef90f3be023b54744c2637589"`);
        await queryRunner.query(`ALTER TABLE "base_user_profile" DROP CONSTRAINT "FK_b1c47caae2070346a412a65c2a7"`);
        await queryRunner.query(`ALTER TABLE "experience" DROP CONSTRAINT "FK_57e06092cab2338fa6a337669aa"`);
        await queryRunner.query(`ALTER TABLE "chat_report" DROP CONSTRAINT "FK_8268e2a31f4ce31a470f57d266e"`);
        await queryRunner.query(`ALTER TABLE "chat_report" DROP CONSTRAINT "FK_1fc2ff6de4399d3c8c8d52440f8"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_e9835cd92ac9e719d6f55e3e9e3"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_6dba494433f6420f81d19fa6de4"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_1a862ba2b3ceb14f888fbb9ceb6"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TYPE "notification_ctx_enum"`);
        await queryRunner.query(`DROP TABLE "volunteer_profiles"`);
        await queryRunner.query(`DROP TABLE "therapist_profiles"`);
        await queryRunner.query(`DROP TABLE "client_profiles"`);
        await queryRunner.query(`DROP TYPE "client_profiles_primaryissue_enum"`);
        await queryRunner.query(`DROP TYPE "client_profiles_currentemploymentstatus_enum"`);
        await queryRunner.query(`DROP TABLE "block_record"`);
        await queryRunner.query(`DROP TABLE "admins"`);
        await queryRunner.query(`DROP TYPE "admins_user_role_enum"`);
        await queryRunner.query(`DROP TABLE "appointment_report"`);
        await queryRunner.query(`DROP TABLE "appointment_rating"`);
        await queryRunner.query(`DROP TABLE "appointment"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP TYPE "transaction_status_enum"`);
        await queryRunner.query(`DROP TABLE "education"`);
        await queryRunner.query(`DROP TABLE "base_user_profile"`);
        await queryRunner.query(`DROP TYPE "base_user_profile_gender_enum"`);
        await queryRunner.query(`DROP TABLE "experience"`);
        await queryRunner.query(`DROP TABLE "chat_report"`);
        await queryRunner.query(`DROP TABLE "chat"`);
        await queryRunner.query(`DROP TYPE "chat_chattype_enum"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TYPE "message_type_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "users_user_role_enum"`);
    }

}
