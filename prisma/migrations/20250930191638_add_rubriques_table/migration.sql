-- CreateEnum
CREATE TYPE "public"."RubriqueType" AS ENUM ('GAIN_BRUT', 'COTISATION', 'GAIN_NON_SOUMIS', 'RETENUE_NON_SOUMISE', 'ELEMENT_NON_IMPOSABLE');

-- CreateTable
CREATE TABLE "public"."rubriques" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "libelle" VARCHAR(200) NOT NULL,
    "type" "public"."RubriqueType" NOT NULL,
    "base" VARCHAR(200),
    "taux" DECIMAL(5,2),
    "formule" TEXT,
    "imposable" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "ordre" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "rubriques_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rubriques_tenant_id_type_idx" ON "public"."rubriques"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "rubriques_tenant_id_is_active_idx" ON "public"."rubriques"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "rubriques_tenant_id_code_key" ON "public"."rubriques"("tenant_id", "code");

-- AddForeignKey
ALTER TABLE "public"."rubriques" ADD CONSTRAINT "rubriques_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
