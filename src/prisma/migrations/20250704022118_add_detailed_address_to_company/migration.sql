/*
  Warnings:

  - You are about to drop the column `address` on the `companies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "companies" DROP COLUMN "address",
ADD COLUMN     "country" TEXT,
ADD COLUMN     "exteriorNumber" TEXT,
ADD COLUMN     "interiorNumber" TEXT,
ADD COLUMN     "municipality" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street" TEXT;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
