-- CreateEnum
CREATE TYPE "RiderStatusEnum" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "rider_status" (
    "status" "RiderStatusEnum" NOT NULL DEFAULT 'PENDING',
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "riderId" TEXT NOT NULL,
    "ccaId" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "rider_status_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "rider_status" ADD CONSTRAINT "rider_status_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "riders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rider_status" ADD CONSTRAINT "rider_status_ccaId_fkey" FOREIGN KEY ("ccaId") REFERENCES "customer_care_agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
