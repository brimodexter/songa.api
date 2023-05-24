-- DropForeignKey
ALTER TABLE "customer_care_agent_token" DROP CONSTRAINT "customer_care_agent_token_userId_fkey";

-- AddForeignKey
ALTER TABLE "customer_care_agent_token" ADD CONSTRAINT "customer_care_agent_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "customer_care_agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
