import { MigrationInterface, QueryRunner } from "typeorm";

export class ProdAddDescriptionColumn1633446107067
  implements MigrationInterface
{
  name = "ProdAddDescriptionColumn1633446107067";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointment_rating" ALTER COLUMN "rating" TYPE integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointment_rating" ALTER COLUMN "rating" TYPE integer`,
    );
  }
}
