# ADR 001 — Exponer AccesosCi como fuente de datos de solo lectura para la plataforma comercial

## Contexto

El equipo del dashboard comercial (otro repositorio, con tablas
`comercial_estructura`/`comercial_membresia`) quiere sincronizar su roster de
asesores desde AccesosCi (altas, modificaciones, bajas). AccesosCi es la
fuente; nunca escribe de vuelta. Ellos son responsables de las fases de
sync (censo, modo sombra, aplicación de eventos); a este repo solo le
corresponde exponer los datos de forma estable y de solo lectura.

## Decisiones

### 1. ID estable por persona (`accesos_id`)

Se usa el **correo corporativo en minúsculas** como identificador estable.
Ya es la clave primaria de facto en `correos_edits` y `miembros_extra`, es
inmutable ante renombres de la persona (el nombre puede editarse, el correo
no) y es además el criterio de match #1 que la plataforma comercial pidió —
usarlo como ID hace que el matching por email sea trivial para ellos.

No se agregó una columna UUID nueva: hubiera sido una fuente de identidad
paralela sin beneficio real, dado que el correo ya cumple el contrato.

### 2. Roster de solo lectura

`obtenerRosterAccesos()` (`src/lib/directorio.ts`) combina:

- `fusionarDirectorio()` (`src/lib/services/directorio.service.ts`, función
  pura y testeada) — fusiona estático (`correos.json`) + dinámico
  (`hojas_extra`/`grupos_extra`/`miembros_extra`) + overrides
  (`correos_edits`), aplicando el mismo criterio que hoy usa
  `ListaCorreos.tsx` (eliminado/transferido/overrides por campo).
- `construirRosterAccesos()` (`src/lib/services/accesosSync.service.ts`) —
  proyecta cada asesor fusionado a `{ id, nombre, email, rol, reportaA,
  estado }`.

**Nota de mantenimiento:** la lógica de fusión vive en dos lugares
(`ListaCorreos.tsx` para la UI, `directorio.service.ts` para este export).
Si se cambia una regla de merge en la UI, hay que replicarla acá. Migrar
`ListaCorreos.tsx` para que consuma `fusionarDirectorio()` directamente
queda pendiente como refactor separado (mayor superficie de riesgo, requiere
verificación manual en navegador).

### 3. Historial de eventos con cursor incremental

`correos_historial` ya registraba ediciones de campo (para la pestaña
"Historial" interna). Se reutiliza para el export, con dos cambios:

- Se agregó el registro de **altas** (`crearMiembroAction` ahora llama
  `registrarHistorial(correo, 'alta', null, etiquetaHojaGrupo, ...)`), que
  antes no dejaban rastro.
- El cursor no puede ser `id` (uuid, no ordenable). Se agregó la columna
  `secuencia bigserial` (ver `docs/migrations/001_correos_historial_secuencia.sql`,
  a ejecutar manualmente en el SQL Editor de Supabase). `leerEventosAccesosDesde(cursor)`
  en `src/lib/db.ts` lee `secuencia > cursor` en orden ascendente.
- `mapearEventosAccesos()` (`src/lib/services/eventosAccesos.service.ts`)
  clasifica cada fila en `creacion` / `modificacion` / `eliminacion` según el
  campo y valor.

### 4. Semántica de baja: soft-delete

Confirmado en código (`eliminarCorreoAction` / `restaurarCorreoAction` en
`src/app/actions.ts`): una "eliminación" nunca hace `DELETE` de una fila,
solo setea el flag `eliminado=true` (+ `eliminado_por`/`eliminado_en`) en
`correos_edits`. Es reversible en cualquier momento por un admin, no solo
durante la ventana de "Deshacer" de la UI. La plataforma comercial puede
tratar la desaparición/reaparición de un `accesos_id` como baja/alta
reversible, sin preocuparse de que el registro se pierda físicamente.

## Pendiente

- Endpoint HTTP protegido (token compartido, no las credenciales de
  Supabase) que exponga roster + eventos incrementales — implementación en
  curso.
- Responder al equipo comercial las preguntas de matching de nombre (¿el
  nombre en AccesosCi coincide con el texto libre que Comercial escribe en
  Jira?) — requiere confirmación humana, no es una decisión de este repo.
