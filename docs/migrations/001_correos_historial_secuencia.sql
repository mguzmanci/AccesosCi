-- ============================================================
-- Cursor incremental para correos_historial (integración con la
-- plataforma comercial de accesos). Ejecutar una sola vez en el
-- SQL Editor de Supabase.
--
-- `id` es uuid (no ordenable); `secuencia` es una columna bigserial
-- monotónica que sirve como cursor: la plataforma comercial guarda
-- el último valor leído y en la siguiente lectura pide
-- "secuencia > cursor" para traer solo lo nuevo.
-- ============================================================

alter table correos_historial
  add column if not exists secuencia bigserial;

create index if not exists correos_historial_secuencia_idx
  on correos_historial (secuencia);
