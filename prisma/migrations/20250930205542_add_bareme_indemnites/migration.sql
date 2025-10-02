-- CreateEnum
CREATE TYPE "public"."TypeIndemnite" AS ENUM ('RETRAITE', 'LICENCIEMENT', 'COMPRESSION', 'MATERNITE', 'FIN_ANNEE');

-- CreateTable
CREATE TABLE "public"."bareme_indemnites" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "type" "public"."TypeIndemnite" NOT NULL,
    "libelle" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "seuil_min" INTEGER,
    "seuil_max" INTEGER,
    "taux" DECIMAL(5,2),
    "montant_mois" INTEGER,
    "anciennete_min_mois" INTEGER,
    "ordre" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "date_effet" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fin" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "bareme_indemnites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bareme_indemnites_tenant_id_type_is_active_idx" ON "public"."bareme_indemnites"("tenant_id", "type", "is_active");

-- CreateIndex
CREATE INDEX "bareme_indemnites_tenant_id_date_effet_idx" ON "public"."bareme_indemnites"("tenant_id", "date_effet");

-- AddForeignKey
ALTER TABLE "public"."bareme_indemnites" ADD CONSTRAINT "bareme_indemnites_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
