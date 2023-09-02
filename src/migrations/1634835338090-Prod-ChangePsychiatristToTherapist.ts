import { MigrationInterface, QueryRunner } from "typeorm";

export class ProdChangePsychiatristToTherapist1634835338090
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "users_user_role_enum" RENAME VALUE 'psychiatrist' TO 'therapist'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "users_user_role_enum" RENAME VALUE 'therapist' TO 'psychiatrist'`,
    );
  }
}
