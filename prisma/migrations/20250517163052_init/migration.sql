-- CreateTable
CREATE TABLE "scan_logs" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "pedimento" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "line" TEXT NOT NULL,
    "shelf" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "quantity" INTEGER,
    "encoded" BOOLEAN,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scan_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventorySession" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventorySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "pedimento" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "line" TEXT NOT NULL,
    "shelf" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "stock" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_items" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_sessionId_key_key" ON "inventory_items"("sessionId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "stock_items_key_key" ON "stock_items"("key");

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InventorySession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
