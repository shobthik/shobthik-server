import {MigrationInterface, QueryRunner} from "typeorm";

export class ProdMakeUserDeletable1634053888377 implements MigrationInterface {
    name = 'ProdMakeUserDeletable1634053888377'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_6dba494433f6420f81d19fa6de4"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_e9835cd92ac9e719d6f55e3e9e3"`);
        await queryRunner.query(`ALTER TABLE "chat_report" DROP CONSTRAINT "FK_8268e2a31f4ce31a470f57d266e"`);
        await queryRunner.query(`ALTER TABLE "experience" DROP CONSTRAINT "FK_57e06092cab2338fa6a337669aa"`);
        await queryRunner.query(`ALTER TABLE "base_user_profile" DROP CONSTRAINT "FK_b1c47caae2070346a412a65c2a7"`);
        await queryRunner.query(`ALTER TABLE "education" DROP CONSTRAINT "FK_21ef90f3be023b54744c2637589"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_6dc0b41cd3de330873a1686653d"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_b01db6b3e203945a6bd5fc5797b"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_15d2701bb83b7aef5fdfef379d5"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_60ac979e3cb15127f2221e3b66d"`);
        await queryRunner.query(`ALTER TABLE "block_record" DROP CONSTRAINT "FK_68f987e1bd9460387000264437b"`);
        await queryRunner.query(`ALTER TABLE "block_record" DROP CONSTRAINT "FK_ad01abb61813359520291de7903"`);
        await queryRunner.query(`ALTER TABLE "client_profiles" DROP CONSTRAINT "FK_00a2abab138fe280e6ba8e4fde7"`);
        await queryRunner.query(`ALTER TABLE "therapist_profiles" DROP CONSTRAINT "FK_3d8ca197165bf1b4af300d0e379"`);
        await queryRunner.query(`ALTER TABLE "volunteer_profiles" DROP CONSTRAINT "FK_a90c210f4a120c40ef376850a11"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`);
        await queryRunner.query(`ALTER TABLE "appointment_rating" ALTER COLUMN "rating" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_6dba494433f6420f81d19fa6de4" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_e9835cd92ac9e719d6f55e3e9e3" FOREIGN KEY ("volunteerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_report" ADD CONSTRAINT "FK_8268e2a31f4ce31a470f57d266e" FOREIGN KEY ("filedByUser") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "experience" ADD CONSTRAINT "FK_57e06092cab2338fa6a337669aa" FOREIGN KEY ("userUserId") REFERENCES "base_user_profile"("userId") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "base_user_profile" ADD CONSTRAINT "FK_b1c47caae2070346a412a65c2a7" FOREIGN KEY ("userIdentifier") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "education" ADD CONSTRAINT "FK_21ef90f3be023b54744c2637589" FOREIGN KEY ("userUserId") REFERENCES "base_user_profile"("userId") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_b01db6b3e203945a6bd5fc5797b" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_6dc0b41cd3de330873a1686653d" FOREIGN KEY ("targetTherapistId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_60ac979e3cb15127f2221e3b66d" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_15d2701bb83b7aef5fdfef379d5" FOREIGN KEY ("therapistId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "block_record" ADD CONSTRAINT "FK_ad01abb61813359520291de7903" FOREIGN KEY ("blockedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "block_record" ADD CONSTRAINT "FK_68f987e1bd9460387000264437b" FOREIGN KEY ("blockedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client_profiles" ADD CONSTRAINT "FK_00a2abab138fe280e6ba8e4fde7" FOREIGN KEY ("baseUserProfileUserId") REFERENCES "base_user_profile"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "therapist_profiles" ADD CONSTRAINT "FK_3d8ca197165bf1b4af300d0e379" FOREIGN KEY ("baseUserProfileUserId") REFERENCES "base_user_profile"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "volunteer_profiles" ADD CONSTRAINT "FK_a90c210f4a120c40ef376850a11" FOREIGN KEY ("baseUserProfileUserId") REFERENCES "base_user_profile"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`);
        await queryRunner.query(`ALTER TABLE "volunteer_profiles" DROP CONSTRAINT "FK_a90c210f4a120c40ef376850a11"`);
        await queryRunner.query(`ALTER TABLE "therapist_profiles" DROP CONSTRAINT "FK_3d8ca197165bf1b4af300d0e379"`);
        await queryRunner.query(`ALTER TABLE "client_profiles" DROP CONSTRAINT "FK_00a2abab138fe280e6ba8e4fde7"`);
        await queryRunner.query(`ALTER TABLE "block_record" DROP CONSTRAINT "FK_68f987e1bd9460387000264437b"`);
        await queryRunner.query(`ALTER TABLE "block_record" DROP CONSTRAINT "FK_ad01abb61813359520291de7903"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_15d2701bb83b7aef5fdfef379d5"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_60ac979e3cb15127f2221e3b66d"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_6dc0b41cd3de330873a1686653d"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_b01db6b3e203945a6bd5fc5797b"`);
        await queryRunner.query(`ALTER TABLE "education" DROP CONSTRAINT "FK_21ef90f3be023b54744c2637589"`);
        await queryRunner.query(`ALTER TABLE "base_user_profile" DROP CONSTRAINT "FK_b1c47caae2070346a412a65c2a7"`);
        await queryRunner.query(`ALTER TABLE "experience" DROP CONSTRAINT "FK_57e06092cab2338fa6a337669aa"`);
        await queryRunner.query(`ALTER TABLE "chat_report" DROP CONSTRAINT "FK_8268e2a31f4ce31a470f57d266e"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_e9835cd92ac9e719d6f55e3e9e3"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_6dba494433f6420f81d19fa6de4"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`);
        await queryRunner.query(`ALTER TABLE "appointment_rating" ALTER COLUMN "rating" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "volunteer_profiles" ADD CONSTRAINT "FK_a90c210f4a120c40ef376850a11" FOREIGN KEY ("baseUserProfileUserId") REFERENCES "base_user_profile"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "therapist_profiles" ADD CONSTRAINT "FK_3d8ca197165bf1b4af300d0e379" FOREIGN KEY ("baseUserProfileUserId") REFERENCES "base_user_profile"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client_profiles" ADD CONSTRAINT "FK_00a2abab138fe280e6ba8e4fde7" FOREIGN KEY ("baseUserProfileUserId") REFERENCES "base_user_profile"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "block_record" ADD CONSTRAINT "FK_ad01abb61813359520291de7903" FOREIGN KEY ("blockedByUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "block_record" ADD CONSTRAINT "FK_68f987e1bd9460387000264437b" FOREIGN KEY ("blockedUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_60ac979e3cb15127f2221e3b66d" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_15d2701bb83b7aef5fdfef379d5" FOREIGN KEY ("therapistId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_b01db6b3e203945a6bd5fc5797b" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_6dc0b41cd3de330873a1686653d" FOREIGN KEY ("targetTherapistId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "education" ADD CONSTRAINT "FK_21ef90f3be023b54744c2637589" FOREIGN KEY ("userUserId") REFERENCES "base_user_profile"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "base_user_profile" ADD CONSTRAINT "FK_b1c47caae2070346a412a65c2a7" FOREIGN KEY ("userIdentifier") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "experience" ADD CONSTRAINT "FK_57e06092cab2338fa6a337669aa" FOREIGN KEY ("userUserId") REFERENCES "base_user_profile"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_report" ADD CONSTRAINT "FK_8268e2a31f4ce31a470f57d266e" FOREIGN KEY ("filedByUser") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_e9835cd92ac9e719d6f55e3e9e3" FOREIGN KEY ("volunteerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_6dba494433f6420f81d19fa6de4" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
