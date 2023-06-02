-- AlterTable
ALTER TABLE "users" ALTER COLUMN "dateCreated" DROP DEFAULT;

-- CreateTable
CREATE TABLE "rider_documents" (
    "ID_front" TEXT,
    "ID_back" TEXT,
    "good_conduct" TEXT,
    "birth_certificate" TEXT,
    "license" TEXT,
    "insurance" TEXT,
    "riderId" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "rider_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rider_documents_riderId_key" ON "rider_documents"("riderId");

-- AddForeignKey
ALTER TABLE "rider_documents" ADD CONSTRAINT "rider_documents_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "riders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
