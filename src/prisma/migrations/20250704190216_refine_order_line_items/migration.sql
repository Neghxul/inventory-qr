/*
  Warnings:

  - Added the required column `unitCost` to the `OrderLineItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderLineItem" ADD COLUMN     "unitCost" DOUBLE PRECISION NOT NULL;
