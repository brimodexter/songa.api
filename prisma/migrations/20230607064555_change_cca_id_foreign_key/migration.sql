/*
  Warnings:

  - You are about to drop the column `ccaId` on the `rider_status` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "rider_status" DROP CONSTRAINT "rider_status_ccaId_fkey";

-- AlterTable
ALTER TABLE "rider_status" DROP COLUMN "ccaId",
ADD COLUMN     "cca_id" TEXT;

-- AddForeignKey
ALTER TABLE "rider_status" ADD CONSTRAINT "rider_status_cca_id_fkey" FOREIGN KEY ("cca_id") REFERENCES "customer_care_agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
