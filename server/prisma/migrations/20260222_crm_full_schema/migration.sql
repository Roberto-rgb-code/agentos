-- CreateEnum
CREATE TYPE "EtapaPipeline" AS ENUM ('NUEVO_CLIENTE', 'COTIZACION_ENVIADA', 'INTERES_AVANZADO', 'CERRADA', 'RECHAZADA');

-- AlterTable: Add new fields to leads
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "ciudad" TEXT;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "interes" TEXT;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "etapa" "EtapaPipeline" NOT NULL DEFAULT 'NUEVO_CLIENTE';
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "probabilidad_cierre" DOUBLE PRECISION NOT NULL DEFAULT 25;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "score_predictivo" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "agente_id" TEXT;

-- CreateTable: conversaciones
CREATE TABLE "conversaciones" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable: agentes
CREATE TABLE "agentes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "motor" TEXT NOT NULL DEFAULT 'ollama',
    "version" TEXT,
    "prompt_base" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: crm_webhooks
CREATE TABLE "crm_webhooks" (
    "id" TEXT NOT NULL,
    "origen" TEXT NOT NULL,
    "payload" JSONB,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable: historico_conversacional
CREATE TABLE "historico_conversacional" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "resumen_15_dias" TEXT,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_conversacional_pkey" PRIMARY KEY ("id")
);

-- CreateTable: productos
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2),
    "categoria" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversaciones_lead_id_idx" ON "conversaciones"("lead_id");
CREATE INDEX "conversaciones_fecha_idx" ON "conversaciones"("fecha");

CREATE INDEX "crm_webhooks_origen_idx" ON "crm_webhooks"("origen");
CREATE INDEX "crm_webhooks_fecha_idx" ON "crm_webhooks"("fecha");

CREATE UNIQUE INDEX "historico_conversacional_lead_id_key" ON "historico_conversacional"("lead_id");
CREATE INDEX "historico_conversacional_lead_id_idx" ON "historico_conversacional"("lead_id");

CREATE INDEX "leads_etapa_idx" ON "leads"("etapa");
CREATE INDEX "leads_ciudad_idx" ON "leads"("ciudad");

CREATE INDEX "productos_categoria_idx" ON "productos"("categoria");
CREATE INDEX "productos_activo_idx" ON "productos"("activo");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_agente_id_fkey" FOREIGN KEY ("agente_id") REFERENCES "agentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "historico_conversacional" ADD CONSTRAINT "historico_conversacional_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- Trigger: actualizar_probabilidad
-- Automatically updates probabilidad_cierre when etapa changes
-- ============================================
CREATE OR REPLACE FUNCTION actualizar_probabilidad()
RETURNS TRIGGER AS $$
BEGIN
    CASE NEW.etapa
        WHEN 'NUEVO_CLIENTE' THEN NEW.probabilidad_cierre := 25;
        WHEN 'COTIZACION_ENVIADA' THEN NEW.probabilidad_cierre := 50;
        WHEN 'INTERES_AVANZADO' THEN NEW.probabilidad_cierre := 75;
        WHEN 'CERRADA' THEN NEW.probabilidad_cierre := 100;
        WHEN 'RECHAZADA' THEN NEW.probabilidad_cierre := 0;
        ELSE NEW.probabilidad_cierre := 0;
    END CASE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_probabilidad ON leads;
CREATE TRIGGER trigger_actualizar_probabilidad
    BEFORE INSERT OR UPDATE OF etapa ON leads
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_probabilidad();

