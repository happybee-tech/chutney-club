ALTER TABLE "Product"
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "Product_brandId_sortOrder_idx" ON "Product"("brandId", "sortOrder");
