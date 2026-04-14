-- AlterTable
ALTER TABLE "Pet" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'Dog';

-- Existing rows get the temporary default above; remove it so future inserts
-- must provide a type that matches the Prisma schema.
ALTER TABLE "Pet" ALTER COLUMN "type" DROP DEFAULT;
