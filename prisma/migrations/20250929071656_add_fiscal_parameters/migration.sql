-- CreateEnum
CREATE TYPE "public"."userrole" AS ENUM ('Administrateur', 'Manager', 'Operateur', 'Consultant');

-- CreateEnum
CREATE TYPE "public"."ParameterType" AS ENUM ('TAUX', 'MONTANT', 'PLAFOND', 'SEUIL');

-- CreateTable
CREATE TABLE "public"."tenants" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(200) NOT NULL,
    "domain" VARCHAR(255),
    "company_name" VARCHAR(200) NOT NULL,
    "company_address" TEXT,
    "company_phone" VARCHAR(50),
    "company_email" VARCHAR(100),
    "nui" VARCHAR(50),
    "rccm" VARCHAR(50),
    "cnss_number" VARCHAR(50),
    "is_active" BOOLEAN,
    "settings" TEXT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "hashed_password" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(50),
    "role" "public"."userrole" NOT NULL,
    "is_active" BOOLEAN,
    "is_verified" BOOLEAN,
    "last_login" TIMESTAMP(6),
    "password_changed_at" TIMESTAMP(6),
    "failed_login_attempts" INTEGER,
    "locked_until" TIMESTAMP(6),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."departments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "parent_id" UUID,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "manager_id" UUID,
    "is_active" BOOLEAN,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."employees" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID,
    "department_id" UUID,
    "employee_code" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "date_of_birth" DATE,
    "place_of_birth" VARCHAR(200),
    "nationality" VARCHAR(100),
    "gender" VARCHAR(10),
    "marital_status" VARCHAR(20),
    "phone" VARCHAR(50),
    "email" VARCHAR(100),
    "address" TEXT,
    "emergency_contact" TEXT,
    "hire_date" DATE NOT NULL,
    "contract_type" VARCHAR(50) NOT NULL,
    "contract_start_date" DATE,
    "contract_end_date" DATE,
    "base_salary" DECIMAL(12,2) NOT NULL,
    "salary_category" VARCHAR(50),
    "payment_method" VARCHAR(50),
    "bank_name" VARCHAR(100),
    "bank_account" VARCHAR(100),
    "cnss_number" VARCHAR(50),
    "camu_number" VARCHAR(50),
    "retirement_number" VARCHAR(50),
    "is_active" BOOLEAN,
    "termination_date" DATE,
    "termination_reason" TEXT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "convention_collective" VARCHAR(100),
    "categorie_professionnelle" INTEGER,
    "echelon" INTEGER,
    "nui" VARCHAR(20),
    "children_count" INTEGER,
    "position" VARCHAR(200) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alembic_version" (
    "version_num" VARCHAR(32) NOT NULL,

    CONSTRAINT "alembic_version_pkc" PRIMARY KEY ("version_num")
);

-- CreateTable
CREATE TABLE "public"."contracts" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "contract_type" VARCHAR(50) NOT NULL,
    "start_date" TIMESTAMP(6) NOT NULL,
    "end_date" TIMESTAMP(6),
    "base_salary" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3),
    "is_active" BOOLEAN,
    "notes" TEXT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."employee_allowances" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "allowance_type" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3),
    "start_date" TIMESTAMP(6) NOT NULL,
    "end_date" TIMESTAMP(6),
    "is_active" BOOLEAN,
    "is_recurring" BOOLEAN,
    "description" TEXT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "employee_allowances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payroll_configs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "irpp_rate" DECIMAL(5,2),
    "cnss_employee_rate" DECIMAL(5,2),
    "cnss_employer_rate" DECIMAL(5,2),
    "minimum_wage" DECIMAL(10,2),
    "default_transport_allowance" DECIMAL(10,2),
    "default_housing_allowance" DECIMAL(10,2),
    "fiscal_year_start_month" VARCHAR(2),
    "payroll_frequency" VARCHAR(20),
    "is_active" BOOLEAN,
    "additional_settings" TEXT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "payroll_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payslips" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "period_month" INTEGER NOT NULL,
    "period_year" INTEGER NOT NULL,
    "base_salary" DECIMAL(10,2) NOT NULL,
    "gross_salary" DECIMAL(10,2) NOT NULL,
    "net_salary" DECIMAL(10,2) NOT NULL,
    "tax_deduction" DECIMAL(10,2),
    "cnss_deduction" DECIMAL(10,2),
    "other_deductions" DECIMAL(10,2),
    "transport_allowance" DECIMAL(10,2),
    "housing_allowance" DECIMAL(10,2),
    "other_allowances" DECIMAL(10,2),
    "is_generated" BOOLEAN,
    "is_sent" BOOLEAN,
    "notes" TEXT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "payslips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "entity" VARCHAR(50) NOT NULL,
    "entity_id" UUID,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip" VARCHAR(45),
    "user_agent" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exercices" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "libelle" VARCHAR(200) NOT NULL,
    "annee" INTEGER NOT NULL,
    "date_debut" DATE NOT NULL,
    "date_fin" DATE NOT NULL,
    "is_actif" BOOLEAN NOT NULL DEFAULT false,
    "is_clos" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "exercices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."employee_charges_fixes" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "rubrique_code" VARCHAR(10) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "employee_charges_fixes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fiscal_parameters" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "libelle" VARCHAR(200) NOT NULL,
    "type" "public"."ParameterType" NOT NULL,
    "value" DECIMAL(15,6) NOT NULL,
    "unit" VARCHAR(20),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "date_effet" DATE NOT NULL,
    "date_fin" DATE,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "fiscal_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."irpp_tranches" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "ordre" INTEGER NOT NULL,
    "seuil_min" DECIMAL(15,2) NOT NULL,
    "seuil_max" DECIMAL(15,2),
    "taux" DECIMAL(5,2) NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "date_effet" DATE NOT NULL,
    "date_fin" DATE,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "irpp_tranches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ix_tenants_name" ON "public"."tenants"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_domain_key" ON "public"."tenants"("domain");

-- CreateIndex
CREATE INDEX "tenants_name_idx" ON "public"."tenants"("name");

-- CreateIndex
CREATE INDEX "tenants_is_active_idx" ON "public"."tenants"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "ix_users_username" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ix_users_email" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "employees_tenant_id_idx" ON "public"."employees"("tenant_id");

-- CreateIndex
CREATE INDEX "employees_tenant_id_is_active_idx" ON "public"."employees"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "employees_tenant_id_employee_code_idx" ON "public"."employees"("tenant_id", "employee_code");

-- CreateIndex
CREATE INDEX "employees_tenant_id_email_idx" ON "public"."employees"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "employees_tenant_id_cnss_number_idx" ON "public"."employees"("tenant_id", "cnss_number");

-- CreateIndex
CREATE INDEX "employees_tenant_id_first_name_last_name_idx" ON "public"."employees"("tenant_id", "first_name", "last_name");

-- CreateIndex
CREATE INDEX "employees_hire_date_idx" ON "public"."employees"("hire_date");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_created_at_idx" ON "public"."audit_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "public"."audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "public"."audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "exercices_tenant_id_idx" ON "public"."exercices"("tenant_id");

-- CreateIndex
CREATE INDEX "exercices_tenant_id_is_actif_idx" ON "public"."exercices"("tenant_id", "is_actif");

-- CreateIndex
CREATE INDEX "exercices_tenant_id_annee_idx" ON "public"."exercices"("tenant_id", "annee");

-- CreateIndex
CREATE UNIQUE INDEX "exercices_tenant_id_annee_key" ON "public"."exercices"("tenant_id", "annee");

-- CreateIndex
CREATE INDEX "employee_charges_fixes_employee_id_idx" ON "public"."employee_charges_fixes"("employee_id");

-- CreateIndex
CREATE INDEX "employee_charges_fixes_employee_id_is_active_idx" ON "public"."employee_charges_fixes"("employee_id", "is_active");

-- CreateIndex
CREATE INDEX "employee_charges_fixes_rubrique_code_idx" ON "public"."employee_charges_fixes"("rubrique_code");

-- CreateIndex
CREATE UNIQUE INDEX "employee_charges_fixes_employee_id_rubrique_code_key" ON "public"."employee_charges_fixes"("employee_id", "rubrique_code");

-- CreateIndex
CREATE INDEX "fiscal_parameters_tenant_id_code_idx" ON "public"."fiscal_parameters"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "fiscal_parameters_tenant_id_is_active_date_effet_idx" ON "public"."fiscal_parameters"("tenant_id", "is_active", "date_effet");

-- CreateIndex
CREATE INDEX "fiscal_parameters_code_date_effet_idx" ON "public"."fiscal_parameters"("code", "date_effet");

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_parameters_tenant_id_code_date_effet_key" ON "public"."fiscal_parameters"("tenant_id", "code", "date_effet");

-- CreateIndex
CREATE INDEX "irpp_tranches_tenant_id_is_active_date_effet_idx" ON "public"."irpp_tranches"("tenant_id", "is_active", "date_effet");

-- CreateIndex
CREATE INDEX "irpp_tranches_tenant_id_ordre_idx" ON "public"."irpp_tranches"("tenant_id", "ordre");

-- CreateIndex
CREATE UNIQUE INDEX "irpp_tranches_tenant_id_ordre_date_effet_key" ON "public"."irpp_tranches"("tenant_id", "ordre", "date_effet");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."departments" ADD CONSTRAINT "departments_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."departments" ADD CONSTRAINT "departments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."departments" ADD CONSTRAINT "departments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."employee_allowances" ADD CONSTRAINT "employee_allowances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."payroll_configs" ADD CONSTRAINT "payroll_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."payslips" ADD CONSTRAINT "payslips_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."exercices" ADD CONSTRAINT "exercices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."employee_charges_fixes" ADD CONSTRAINT "employee_charges_fixes_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."fiscal_parameters" ADD CONSTRAINT "fiscal_parameters_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."irpp_tranches" ADD CONSTRAINT "irpp_tranches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
