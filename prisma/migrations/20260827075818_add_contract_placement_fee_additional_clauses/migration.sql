-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "additional_clauses" TEXT,
ADD COLUMN     "placement_fee" DECIMAL(12,2) NOT NULL DEFAULT 0;
