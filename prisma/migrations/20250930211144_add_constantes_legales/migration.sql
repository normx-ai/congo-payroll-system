-- CreateEnum
CREATE TYPE "public"."TypeConstante" AS ENUM ('TEMPS_TRAVAIL', 'CONGES', 'CONVERSION', 'SEUIL_LEGAL');

-- CreateTable
CREATE TABLE "public"."constantes_legales" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "type" "public"."TypeConstante" NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "libelle" VARCHAR(200) NOT NULL,
    "valeur" DECIMAL(10,4) NOT NULL,
    "unite" VARCHAR(50),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "date_effet" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fin" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "constantes_legales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "constantes_legales_tenant_id_type_is_active_idx" ON "public"."constantes_legales"("tenant_id", "type", "is_active");

-- CreateIndex
CREATE INDEX "constantes_legales_tenant_id_date_effet_idx" ON "public"."constantes_legales"("tenant_id", "date_effet");

-- CreateIndex
CREATE UNIQUE INDEX "constantes_legales_tenant_id_code_date_effet_key" ON "public"."constantes_legales"("tenant_id", "code", "date_effet");

-- AddForeignKey
ALTER TABLE "public"."constantes_legales" ADD CONSTRAINT "constantes_legales_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
