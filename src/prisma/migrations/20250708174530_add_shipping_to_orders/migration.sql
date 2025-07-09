-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'WAREHOUSE';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingCarrier" TEXT,
ADD COLUMN     "trackingNumber" TEXT;
