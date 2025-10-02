-- CreateEnum
CREATE TYPE "public"."SituationFamiliale" AS ENUM ('CELIBATAIRE', 'MARIE', 'VEUF', 'DIVORCE');

-- CreateTable
CREATE TABLE "public"."bareme_quotient_familial" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "situation_familiale" "public"."SituationFamiliale" NOT NULL,
    "nb_enfants_min" INTEGER NOT NULL,
    "nb_enfants_max" INTEGER,
    "parts" DECIMAL(3,1) NOT NULL,
    "description" TEXT,
    "ordre" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "date_effet" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fin" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "bareme_quotient_familial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bareme_quotient_familial_tenant_id_situation_familiale_is_a_idx" ON "public"."bareme_quotient_familial"("tenant_id", "situation_familiale", "is_active");

-- CreateIndex
CREATE INDEX "bareme_quotient_familial_tenant_id_date_effet_idx" ON "public"."bareme_quotient_familial"("tenant_id", "date_effet");

-- AddForeignKey
ALTER TABLE "public"."bareme_quotient_familial" ADD CONSTRAINT "bareme_quotient_familial_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
