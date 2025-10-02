-- CreateEnum
CREATE TYPE "public"."BulletinStatus" AS ENUM ('draft', 'validated', 'archived');

-- CreateTable
CREATE TABLE "public"."bulletins_paie" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "periode" VARCHAR(7) NOT NULL,
    "pdf_path" VARCHAR(500),
    "status" "public"."BulletinStatus" NOT NULL DEFAULT 'draft',
    "gross_salary" DECIMAL(15,2) NOT NULL,
    "net_salary" DECIMAL(15,2) NOT NULL,
    "total_deductions" DECIMAL(15,2) NOT NULL,
    "total_charges_patronales" DECIMAL(15,2) NOT NULL,
    "data_json" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "bulletins_paie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."etats_charges_mensuels" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "periode" VARCHAR(7) NOT NULL,
    "total_employees" INTEGER NOT NULL,
    "total_gross_salary" DECIMAL(15,2) NOT NULL,
    "total_net_salary" DECIMAL(15,2) NOT NULL,
    "total_charges_patronales" DECIMAL(15,2) NOT NULL,
    "total_charges_salariales" DECIMAL(15,2) NOT NULL,
    "pdf_path" VARCHAR(500),
    "data_json" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "etats_charges_mensuels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bulletins_paie_tenant_id_periode_idx" ON "public"."bulletins_paie"("tenant_id", "periode");

-- CreateIndex
CREATE INDEX "bulletins_paie_tenant_id_status_idx" ON "public"."bulletins_paie"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "bulletins_paie_tenant_id_year_month_idx" ON "public"."bulletins_paie"("tenant_id", "year", "month");

-- CreateIndex
CREATE INDEX "bulletins_paie_employee_id_year_month_idx" ON "public"."bulletins_paie"("employee_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "bulletins_paie_employee_id_periode_key" ON "public"."bulletins_paie"("employee_id", "periode");

-- CreateIndex
CREATE INDEX "etats_charges_mensuels_tenant_id_year_month_idx" ON "public"."etats_charges_mensuels"("tenant_id", "year", "month");

-- CreateIndex
CREATE INDEX "etats_charges_mensuels_periode_idx" ON "public"."etats_charges_mensuels"("periode");

-- CreateIndex
CREATE UNIQUE INDEX "etats_charges_mensuels_tenant_id_periode_key" ON "public"."etats_charges_mensuels"("tenant_id", "periode");

-- AddForeignKey
ALTER TABLE "public"."bulletins_paie" ADD CONSTRAINT "bulletins_paie_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bulletins_paie" ADD CONSTRAINT "bulletins_paie_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."etats_charges_mensuels" ADD CONSTRAINT "etats_charges_mensuels_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
