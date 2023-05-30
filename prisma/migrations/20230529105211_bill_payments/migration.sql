-- AlterTable
ALTER TABLE "users" ALTER COLUMN "dateCreated" DROP DEFAULT;

-- CreateTable
CREATE TABLE "MpesaPayBillPayments" (
    "trans_id" TEXT NOT NULL,
    "trans_time" TIMESTAMP(3) NOT NULL,
    "trans_amount" MONEY NOT NULL,
    "bill_ref_number" TEXT NOT NULL,
    "sender_msisdn" TEXT NOT NULL,
    "sender_name" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "MpesaPayBillPayments_trans_id_key" ON "MpesaPayBillPayments"("trans_id");
