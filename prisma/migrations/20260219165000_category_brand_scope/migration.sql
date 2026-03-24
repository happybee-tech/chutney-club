-- 1) Add brandId as nullable first to safely backfill.
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "brandId" TEXT;

-- 2) Guardrail: if legacy categories exist, at least one brand must already exist.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Category") AND NOT EXISTS (SELECT 1 FROM "Brand") THEN
    RAISE EXCEPTION 'Create at least one brand before applying this migration.';
  END IF;
END $$;

-- 3) Backfill categories to first available brand.
WITH first_brand AS (
  SELECT "id" FROM "Brand" ORDER BY "createdAt" ASC LIMIT 1
)
UPDATE "Category"
SET "brandId" = (SELECT "id" FROM first_brand)
WHERE "brandId" IS NULL;

-- 4) Make brandId mandatory.
ALTER TABLE "Category" ALTER COLUMN "brandId" SET NOT NULL;

-- 5) Replace global slug uniqueness with brand-scoped uniqueness.
DROP INDEX IF EXISTS "Category_slug_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Category_brandId_slug_key" ON "Category"("brandId", "slug");
CREATE INDEX IF NOT EXISTS "Category_brandId_idx" ON "Category"("brandId");

-- 6) Add FK.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'Category_brandId_fkey'
      AND table_name = 'Category'
  ) THEN
    ALTER TABLE "Category"
      ADD CONSTRAINT "Category_brandId_fkey"
      FOREIGN KEY ("brandId") REFERENCES "Brand"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
