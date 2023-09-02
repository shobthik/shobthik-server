import {MigrationInterface, QueryRunner} from "typeorm";

export class ProdAddPaymentInfoColumn1637323722474 implements MigrationInterface {
    name = 'ProdAddPaymentInfoColumn1637323722474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_ccb316b4b0cc69c9f479af7cf0a"`);
        await queryRunner.query(`ALTER TABLE "therapist_profiles" ADD "paymentAccountInformation" jsonb`);
        await queryRunner.query(`ALTER TABLE "appointment_rating" ALTER COLUMN "rating" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_ccb316b4b0cc69c9f479af7cf0a" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_ccb316b4b0cc69c9f479af7cf0a"`);
        await queryRunner.query(`ALTER TABLE "appointment_rating" ALTER COLUMN "rating" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "therapist_profiles" DROP COLUMN "paymentAccountInformation"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_ccb316b4b0cc69c9f479af7cf0a" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
