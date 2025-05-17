/*
  Warnings:

  - Added the required column `type` to the `inventory_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "inventory_items" ADD COLUMN     "type" TEXT NOT NULL;
