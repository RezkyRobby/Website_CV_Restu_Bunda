-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'CS', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "WorkerCategory" AS ENUM ('BABY_SITTER', 'ART', 'PERAWAT_LANSIA', 'SUPIR');

-- CreateEnum
CREATE TYPE "WorkerStatus" AS ENUM ('STANDBY', 'INTERVIEW', 'PLACED', 'ON_LEAVE', 'BLACKLIST');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('BELUM_MENIKAH', 'MENIKAH', 'CERAI_HIDUP', 'CERAI_MATI');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'EXPIRING_SOON', 'COMPLETED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "WarrantyClaimStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'CANDIDATES_OFFERED', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReplacementOfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('PLACEMENT_FEE', 'REPLACEMENT_FEE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('DRAFT', 'PAID');

-- CreateEnum
CREATE TYPE "JobRunStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "DocumentPrefix" AS ENUM ('SPK', 'CLM', 'INV');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "phone" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers" (
    "id" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "no_kk" TEXT,
    "full_name" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "religion" "Religion" NOT NULL,
    "marital_status" "MaritalStatus" NOT NULL,
    "ethnicity" TEXT NOT NULL,
    "domicile_address" TEXT NOT NULL,
    "category" "WorkerCategory" NOT NULL,
    "status" "WorkerStatus" NOT NULL DEFAULT 'STANDBY',
    "stayIn" BOOLEAN NOT NULL,
    "expected_salary" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pet_tolerance" BOOLEAN NOT NULL DEFAULT false,
    "willing_out_of_city" BOOLEAN NOT NULL DEFAULT false,
    "photo_profile_url" TEXT NOT NULL,
    "ktp_document_url" TEXT NOT NULL,
    "mcu_report_url" TEXT,
    "skck_verified" BOOLEAN NOT NULL DEFAULT false,
    "skck_document_url" TEXT,
    "training_certificates" JSONB,
    "guarantor_name" TEXT NOT NULL,
    "guarantor_phone" TEXT NOT NULL,
    "guarantor_relation" TEXT,
    "data_consent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_skills" (
    "worker_id" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,

    CONSTRAINT "worker_skills_pkey" PRIMARY KEY ("worker_id","skill_id")
);

-- CreateTable
CREATE TABLE "worker_experiences" (
    "id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "employer_location" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "reason_for_leaving" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "contract_number" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "agreed_salary" DECIMAL(12,2) NOT NULL,
    "warranty_days" INTEGER NOT NULL DEFAULT 90,
    "max_replacements" INTEGER NOT NULL DEFAULT 2,
    "replacements_used" INTEGER NOT NULL DEFAULT 0,
    "spk_document_url" TEXT,
    "spk_stamped_url" TEXT,
    "is_h30_notified" BOOLEAN NOT NULL DEFAULT false,
    "is_h14_notified" BOOLEAN NOT NULL DEFAULT false,
    "is_h7_notified" BOOLEAN NOT NULL DEFAULT false,
    "renewed_from_contract_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warranty_claims" (
    "id" TEXT NOT NULL,
    "claim_number" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "detailed_complaint" TEXT NOT NULL,
    "replacement_criteria" JSONB NOT NULL,
    "status" "WarrantyClaimStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warranty_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "replacement_offers" (
    "id" TEXT NOT NULL,
    "claim_id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "status" "ReplacementOfferStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "replacement_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_logs" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salary_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_role" "UserRole" NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_evaluations" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "period_month" TIMESTAMP(3) NOT NULL,
    "rating_discipline" INTEGER NOT NULL,
    "rating_cleanliness" INTEGER NOT NULL,
    "rating_attitude" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'DRAFT',
    "payment_date" TIMESTAMP(3),
    "method" TEXT,
    "receipt_url" TEXT,
    "confirmed_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "client_origin" TEXT NOT NULL,
    "photo_url" TEXT,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_runs" (
    "id" TEXT NOT NULL,
    "job_key" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "status" "JobRunStatus" NOT NULL DEFAULT 'RUNNING',
    "duration_ms" INTEGER,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_sequences" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "last_value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "document_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "workers_nik_key" ON "workers"("nik");

-- CreateIndex
CREATE INDEX "workers_status_category_idx" ON "workers"("status", "category");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE INDEX "worker_experiences_worker_id_idx" ON "worker_experiences"("worker_id");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_contract_number_key" ON "contracts"("contract_number");

-- CreateIndex
CREATE INDEX "contracts_status_end_date_idx" ON "contracts"("status", "end_date");

-- CreateIndex
CREATE INDEX "contracts_client_id_idx" ON "contracts"("client_id");

-- CreateIndex
CREATE INDEX "contracts_worker_id_idx" ON "contracts"("worker_id");

-- CreateIndex
CREATE UNIQUE INDEX "warranty_claims_claim_number_key" ON "warranty_claims"("claim_number");

-- CreateIndex
CREATE INDEX "warranty_claims_contract_id_status_idx" ON "warranty_claims"("contract_id", "status");

-- CreateIndex
CREATE INDEX "replacement_offers_claim_id_status_idx" ON "replacement_offers"("claim_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "replacement_offers_claim_id_worker_id_key" ON "replacement_offers"("claim_id", "worker_id");

-- CreateIndex
CREATE INDEX "salary_logs_contract_id_idx" ON "salary_logs"("contract_id");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "activity_logs_entity_type_entity_id_idx" ON "activity_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "worker_evaluations_contract_id_period_month_key" ON "worker_evaluations"("contract_id", "period_month");

-- CreateIndex
CREATE UNIQUE INDEX "payments_invoice_number_key" ON "payments"("invoice_number");

-- CreateIndex
CREATE INDEX "payments_contract_id_idx" ON "payments"("contract_id");

-- CreateIndex
CREATE INDEX "testimonials_is_published_idx" ON "testimonials"("is_published");

-- CreateIndex
CREATE INDEX "job_runs_job_key_started_at_idx" ON "job_runs"("job_key", "started_at");

-- CreateIndex
CREATE UNIQUE INDEX "document_sequences_prefix_year_key" ON "document_sequences"("prefix", "year");

-- AddForeignKey
ALTER TABLE "worker_skills" ADD CONSTRAINT "worker_skills_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_skills" ADD CONSTRAINT "worker_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_experiences" ADD CONSTRAINT "worker_experiences_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_renewed_from_contract_id_fkey" FOREIGN KEY ("renewed_from_contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranty_claims" ADD CONSTRAINT "warranty_claims_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranty_claims" ADD CONSTRAINT "warranty_claims_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "replacement_offers" ADD CONSTRAINT "replacement_offers_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "warranty_claims"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "replacement_offers" ADD CONSTRAINT "replacement_offers_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_logs" ADD CONSTRAINT "salary_logs_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_evaluations" ADD CONSTRAINT "worker_evaluations_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_evaluations" ADD CONSTRAINT "worker_evaluations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_confirmed_by_id_fkey" FOREIGN KEY ("confirmed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
