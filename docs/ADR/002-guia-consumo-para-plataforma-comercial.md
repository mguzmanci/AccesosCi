# Guía para el equipo comercial — cómo consumir la API de AccesosCi

Este documento es para pegar en Claude Code (u otro agente) del repositorio
del **dashboard comercial**, para implementar el consumo de la integración
descrita en `001-integracion-plataforma-comercial.md`. AccesosCi es de solo
lectura: nunca hay que escribirle nada.

## 0. Credenciales que necesitas

- `ACCESOS_API_URL` — la URL base del deploy de AccesosCi en Railway (pídesela
  a Tomás; algo como `https://accesosci-production.up.railway.app`).
- `ACCESOS_SYNC_TOKEN` — token secreto compartido (te lo pasa Tomás por un
  canal seguro, no por Slack/email en texto plano si se puede evitar).

Guárdalos como variables de entorno en tu proyecto (`.env`), nunca hardcodeados.

## 1. Los dos endpoints disponibles

Ambos son `GET`, requieren el header `Authorization: Bearer <ACCESOS_SYNC_TOKEN>`,
y devuelven `401` si el token falta o no coincide.

### `GET /api/accesos-sync/roster`

Roster completo actual (snapshot, no incremental). Úsalo para el censo
inicial (Fase 0 del plan) y como referencia de verificación.

```json
{
  "roster": [
    {
      "id": "ana@capitalinteligente.cl",
      "nombre": "Ana Torres",
      "email": "ana@capitalinteligente.cl",
      "rol": "asesor",
      "reportaA": "MBP Martín Guzmán · Avanti",
      "estado": "activo"
    }
  ]
}
```

Campos:
- `id` — **este es el `accesos_id` estable** que guardas en tu columna nueva
  `comercial_estructura.accesos_id`. Es el correo corporativo en minúsculas;
  no cambia con renombres de la persona.
- `rol` — `"asesor" | "tl" | "bp"`.
- `reportaA` — string `"<MBP> · <BP>"` (nombre del MBP y del grupo/BP al que
  pertenece hoy). Úsalo para tu matching de estructura, no lo parsees de forma
  frágil — si necesitas los IDs separados, pídeselo a Tomás como campo
  adicional en vez de hacer parsing de string.
- `estado` — `"activo" | "eliminado"`. `"eliminado"` es **soft-delete**:
  reversible en cualquier momento del lado de AccesosCi. Trata la
  desaparición/reaparición de un `id` como baja/alta reversible, nunca borres
  el nodo local por esto.

### `GET /api/accesos-sync/eventos?cursor=<N>`

Lectura incremental. `cursor` es el último valor de `secuencia` que ya
procesaste (empieza en `0` para traer todo el historial disponible).

```json
{
  "eventos": [
    {
      "cursor": 158,
      "correoId": "beto@capitalinteligente.cl",
      "tipo": "creacion",
      "campo": "alta",
      "valorAnterior": null,
      "valorNuevo": "MBP Nuevo · Vanema",
      "usuarioEmail": "tmallea@capitalinteligente.cl",
      "timestamp": "2026-08-04T12:00:00.000Z"
    }
  ],
  "cursorSiguiente": 158
}
```

Campos:
- `cursor` — número entero monotónico (no es re-usable como timestamp; solo
  sirve para paginar). **Persiste `cursorSiguiente` en tu propia BD** después
  de cada lectura exitosa — es el que le mandas de vuelta en la siguiente
  llamada.
- `correoId` — mismo `accesos_id` que en el roster.
- `tipo` — `"creacion" | "modificacion" | "eliminacion"`. Ya viene
  clasificado, no necesitas inferirlo tú.
- `campo`/`valorAnterior`/`valorNuevo` — diff crudo del campo que cambió (ej.
  `campo: "estado"`, `valorNuevo: "Eliminado"`, o `campo: "mbp_bp"` cuando se
  mueve de BP/MBP). Úsalo solo como bitácora/debug; para tu lógica de negocio
  confía en `tipo`, no en el contenido exacto de `campo`/`valorNuevo` (son
  strings internos de AccesosCi y pueden cambiar de formato).
- La respuesta viene ordenada ascendente por `cursor` y acotada a 500 filas
  por llamada — si `eventos.length === 500`, probablemente haya más: vuelve a
  pedir con `cursor = cursorSiguiente` hasta que la respuesta venga más corta.

## 2. Implementación recomendada (paso a paso)

1. **Cliente HTTP mínimo** — una función `fetchAccesos(path)` que agregue el
   header `Authorization` y lance si la respuesta no es `2xx`.
2. **Job de sync en modo sombra primero** (Fase 1 de tu plan): lee
   `/roster` una vez, guarda el resultado en tu tabla `accesos_sync_log` como
   `simulado`, sin tocar `comercial_estructura` todavía. Compara contra tu
   censo manual (casos A/B/C/D/E del plan).
3. **Persistencia del cursor**: una tabla o fila única con
   `ultimo_cursor_accesos bigint not null default 0`. Solo se actualiza
   después de procesar el batch completo con éxito (si tu proceso falla a
   mitad de un batch, debe poder reintentar desde el mismo `cursor` sin
   duplicar — idempotencia, como pide tu plan en la Fase 2).
4. **Aplicar eventos en orden**, uno por uno, nunca en paralelo (el orden
   importa: un `mbp_bp` seguido de una `eliminacion` no es lo mismo si se
   aplican al revés).
5. **Nunca hagas DELETE físico** de un nodo por un evento de AccesosCi —
   incluso si en algún momento un `accesos_id` deja de aparecer en el roster,
   trátalo como baja soft (tu propio principio rector: la plataforma
   gobierna el futuro, no reescribe el pasado).
6. **Polling**: cada N minutos (mismo patrón que uses hoy para otros
   refreshes), llamar `/eventos?cursor=<ultimo_cursor_accesos>`, aplicar,
   actualizar el cursor. Si la llamada falla (network, 5xx), no actualices el
   cursor y reintenta en el siguiente ciclo — nunca apliques un batch parcial.
7. **Health check**: expón en tu propio `/api/health` el timestamp de la
   última sync exitosa y el cursor actual, para poder detectar si AccesosCi
   deja de responder o si tu job se atascó.

## 3. Ejemplo mínimo (Node/TypeScript)

```ts
const ACCESOS_API_URL = process.env.ACCESOS_API_URL!;
const ACCESOS_SYNC_TOKEN = process.env.ACCESOS_SYNC_TOKEN!;

async function fetchAccesos(path: string) {
  const res = await fetch(`${ACCESOS_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${ACCESOS_SYNC_TOKEN}` },
  });
  if (!res.ok) throw new Error(`AccesosCi ${path}: HTTP ${res.status}`);
  return res.json();
}

// Roster completo (censo inicial / verificación)
const { roster } = await fetchAccesos('/api/accesos-sync/roster');

// Eventos incrementales
let cursor = await leerUltimoCursorGuardado(); // tu propia persistencia
for (;;) {
  const { eventos, cursorSiguiente } = await fetchAccesos(
    `/api/accesos-sync/eventos?cursor=${cursor}`,
  );
  if (eventos.length === 0) break;
  for (const evento of eventos) {
    await aplicarEvento(evento); // tu lógica de negocio
  }
  cursor = cursorSiguiente;
  await guardarUltimoCursor(cursor);
  if (eventos.length < 500) break; // no había más
}
```

## 4. Qué NO hacer

- No llamar a Supabase de AccesosCi directamente ni pedir su
  `service_role key` — solo estos dos endpoints, con el token compartido.
- No inferir el `rol` "bp"/"mbp" de un nodo comparando nombres de string; usa
  el campo `rol` que ya viene resuelto.
- No re-atribuir ops/comisiones existentes basándose en un evento de sync —
  eso es responsabilidad exclusiva de tu Fase 0 (congelación de membresías) y
  tu principio rector, no de esta API.
