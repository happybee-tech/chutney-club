DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
    CREATE TYPE "UserRole" AS ENUM ('customer', 'admin', 'vendor');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'role'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'customer';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
