-- DropForeignKey
ALTER TABLE "rider_documents" DROP CONSTRAINT "rider_documents_riderId_fkey";

-- DropForeignKey
ALTER TABLE "user_otps" DROP CONSTRAINT "user_otps_userId_fkey";

-- CreateTable
CREATE TABLE "rider_profiles" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "avatar" TEXT,
    "address" TEXT,
    "gender" "Gender",
    "location" TEXT NOT NULL,

    CONSTRAINT "rider_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bike_information" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "bikeType" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "bikePhoto" TEXT,
    "insuranceProvider" TEXT NOT NULL,
    "insurancePolicyNumber" TEXT NOT NULL,

    CONSTRAINT "bike_information_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rider_profiles_riderId_key" ON "rider_profiles"("riderId");

-- CreateIndex
CREATE UNIQUE INDEX "bike_information_riderId_key" ON "bike_information"("riderId");

-- AddForeignKey
ALTER TABLE "user_otps" ADD CONSTRAINT "user_otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rider_profiles" ADD CONSTRAINT "rider_profiles_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "riders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bike_information" ADD CONSTRAINT "bike_information_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "rider_profiles"("riderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rider_documents" ADD CONSTRAINT "rider_documents_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "rider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
