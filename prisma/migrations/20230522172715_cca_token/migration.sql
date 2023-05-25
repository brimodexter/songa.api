-- AlterTable
ALTER TABLE "customer_care_agent" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "customer_care_agent_token" (
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "customer_care_agent_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_care_agent_token_userId_key" ON "customer_care_agent_token"("userId");

-- AddForeignKey
ALTER TABLE "customer_care_agent_token" ADD CONSTRAINT "customer_care_agent_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "customer_care_agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
