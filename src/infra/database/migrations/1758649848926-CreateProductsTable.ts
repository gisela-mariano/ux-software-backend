import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductsTable1758649848926 implements MigrationInterface {
  name = "CreateProductsTable1758649848926";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "role" TO "roles"`);
    await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_roles_enum"`);
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "price" double precision NOT NULL, "imageUrls" character varying(255) array, "description" text, "userId" uuid NOT NULL, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_99d90c2a483d79f3b627fb1d5e9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_99d90c2a483d79f3b627fb1d5e9"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`ALTER TYPE "public"."users_roles_enum" RENAME TO "users_role_enum"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "roles" TO "role"`);
  }
}
