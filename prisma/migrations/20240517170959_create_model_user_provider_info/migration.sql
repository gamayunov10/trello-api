-- AlterTable
ALTER TABLE "password_recovery_code" ALTER COLUMN "expiration_date" SET DEFAULT CURRENT_TIMESTAMP + interval '4 hours';

-- CreateTable
CREATE TABLE "user_provider_info" (
    "user_provider_info_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "user_provider_id" TEXT NOT NULL,
    "display_name" TEXT,
    "email" TEXT,
    "city" TEXT,
    "userId" TEXT,

    CONSTRAINT "user_provider_info_pkey" PRIMARY KEY ("user_provider_info_id")
);

-- AddForeignKey
ALTER TABLE "user_provider_info" ADD CONSTRAINT "user_provider_info_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
