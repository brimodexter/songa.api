/*
  Warnings:

  - Added the required column `org_account_balance` to the `MpesaPayBillPayments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_type` to the `MpesaPayBillPayments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MpesaTransactionType" AS ENUM ('PAY_BILL', 'TILL_NUMBER');

-- AlterTable
ALTER TABLE "MpesaPayBillPayments" ADD COLUMN     "org_account_balance" MONEY NOT NULL,
ADD COLUMN     "transaction_type" "MpesaTransactionType" NOT NULL,
ALTER COLUMN "bill_ref_number" DROP NOT NULL;

-- CreateTable
CREATE TABLE "customer_care_agent_reset_token" (
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "customer_care_agent_reset_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_care_agent_reset_token_userId_key" ON "customer_care_agent_reset_token"("userId");

-- AddForeignKey
ALTER TABLE "customer_care_agent_reset_token" ADD CONSTRAINT "customer_care_agent_reset_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "customer_care_agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
