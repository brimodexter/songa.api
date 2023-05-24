-- AlterTable
ALTER TABLE "users" ALTER COLUMN "dateCreated" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "user_otps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" INTEGER NOT NULL,

    CONSTRAINT "user_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_otps_userId_key" ON "user_otps"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_otps_phone_key" ON "user_otps"("phone");

-- AddForeignKey
ALTER TABLE "user_otps" ADD CONSTRAINT "user_otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
