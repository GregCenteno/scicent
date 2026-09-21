-- Agrega idioma, prioridad "en español" y acceso abierto a Article.
-- Solo agrega columnas — no toca datos existentes (quedan en sus valores
-- por defecto hasta el próximo refresh, que los llena de verdad).
ALTER TABLE "Article" ADD COLUMN "language" TEXT;
ALTER TABLE "Article" ADD COLUMN "isSpanish" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Article" ADD COLUMN "isOpenAccess" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Article_isSpanish_publishedAt_idx" ON "Article"("isSpanish", "publishedAt");
