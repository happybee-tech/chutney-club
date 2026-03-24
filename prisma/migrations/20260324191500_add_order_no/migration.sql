-- Add external order number (ORD + 10 digits)
ALTER TABLE "Order"
ADD COLUMN "orderNo" TEXT;

CREATE UNIQUE INDEX "Order_orderNo_key" ON "Order"("orderNo");
