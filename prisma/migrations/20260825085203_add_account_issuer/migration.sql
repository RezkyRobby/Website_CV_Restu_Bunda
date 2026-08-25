-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "issuer" TEXT NOT NULL DEFAULT 'local:credential';
