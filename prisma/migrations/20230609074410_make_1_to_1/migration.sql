/*
  Warnings:

  - You are about to drop the column `riderId` on the `rider_status` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rider_id]` on the table `rider_status` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rider_id` to the `rider_status` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "rider_status" DROP CONSTRAINT "rider_status_riderId_fkey";

-- AlterTable
ALTER TABLE "rider_status" DROP COLUMN "riderId",
ADD COLUMN     "rider_id" TEXT NOT NULL,
ALTER COLUMN "message" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "rider_status_rider_id_key" ON "rider_status"("rider_id");

-- AddForeignKey
ALTER TABLE "rider_status" ADD CONSTRAINT "rider_status_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
