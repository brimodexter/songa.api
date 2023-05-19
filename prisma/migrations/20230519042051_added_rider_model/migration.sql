/*
  Warnings:

  - You are about to drop the `customer care agents` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dateCreated` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dateCreated" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "customer care agents";

-- CreateTable
CREATE TABLE "riders" (
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "avatar" TEXT,
    "email" TEXT,
    "address" TEXT,
    "gender" "Gender",
    "sessionToken" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,

    CONSTRAINT "riders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_care_agent" (
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "id" TEXT NOT NULL,

    CONSTRAINT "customer_care_agent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "riders_phone_key" ON "riders"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "riders_email_key" ON "riders"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customer_care_agent_email_key" ON "customer_care_agent"("email");
