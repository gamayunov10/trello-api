/*
  Warnings:

  - Added the required column `title` to the `column` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "column" ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "password_recovery_code" ALTER COLUMN "expiration_date" SET DEFAULT CURRENT_TIMESTAMP + interval '4 hours';
