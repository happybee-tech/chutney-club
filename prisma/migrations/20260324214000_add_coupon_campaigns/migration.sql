CREATE TABLE "CouponCampaign" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "discountPct" DECIMAL(65,30) NOT NULL,
  "minSubtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "maxDiscount" DECIMAL(65,30),
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CouponCampaign_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CouponCampaign_code_key" ON "CouponCampaign"("code");
CREATE INDEX "CouponCampaign_isActive_startsAt_endsAt_idx" ON "CouponCampaign"("isActive", "startsAt", "endsAt");
