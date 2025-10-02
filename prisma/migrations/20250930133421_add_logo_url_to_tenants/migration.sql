-- CreateEnum
CREATE TYPE "public"."SalaryChangeType" AS ENUM ('PROMOTION', 'SALARY_INCREASE', 'SALARY_DECREASE', 'CONVENTION_CHANGE', 'ADJUSTMENT', 'INITIAL');

-- AlterTable
ALTER TABLE "public"."tenants" ADD COLUMN     "logo_url" VARCHAR(500);

-- CreateTable
CREATE TABLE "public"."employee_salary_history" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "change_date" TIMESTAMP(6) NOT NULL,
    "effective_date" DATE NOT NULL,
    "change_type" "public"."SalaryChangeType" NOT NULL,
    "change_reason" VARCHAR(200) NOT NULL,
    "old_base_salary" DECIMAL(15,2),
    "old_categorie_professionnelle" INTEGER,
    "old_echelon" INTEGER,
    "old_convention_collective" VARCHAR(100),
    "new_base_salary" DECIMAL(15,2),
    "new_categorie_professionnelle" INTEGER,
    "new_echelon" INTEGER,
    "new_convention_collective" VARCHAR(100),
    "is_retroactive" BOOLEAN NOT NULL DEFAULT false,
    "impacted_bulletins" TEXT[],
    "notes" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_salary_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employee_salary_history_employee_id_effective_date_idx" ON "public"."employee_salary_history"("employee_id", "effective_date");

-- CreateIndex
CREATE INDEX "employee_salary_history_tenant_id_change_date_idx" ON "public"."employee_salary_history"("tenant_id", "change_date");

-- CreateIndex
CREATE INDEX "employee_salary_history_tenant_id_is_retroactive_idx" ON "public"."employee_salary_history"("tenant_id", "is_retroactive");

-- CreateIndex
CREATE INDEX "employee_salary_history_user_id_change_date_idx" ON "public"."employee_salary_history"("user_id", "change_date");

-- AddForeignKey
ALTER TABLE "public"."employee_salary_history" ADD CONSTRAINT "employee_salary_history_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employee_salary_history" ADD CONSTRAINT "employee_salary_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employee_salary_history" ADD CONSTRAINT "employee_salary_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
