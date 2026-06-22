# 002 - Arquitectura del MVP

## Contexto

App "Solicitudes de Accesos" para hackathon. Reemplaza el flujo por correo a `accesos@capitalinteligente.cl`.

## Decisión

- **Persistencia:** archivos JSON en `data/` (`usuarios.json`, `plataformas.json`, `solicitudes.json`). Sin servidor de DB.
- **Auth:** login restringido al dominio `@capitalinteligente.cl`. Dos roles:
  - `solicitante`: crea solicitudes y ve solo las propias.
  - `equipo`: ve todas las solicitudes, cambia estados y las marca como completadas.
  - Sesión simple vía cookie httpOnly (no producción; suficiente para demo).
- **Notificación:** correo **simulado** — el servicio construye el `{ to, subject, body }` y se muestra/loguea, sin SMTP real.

## Diseño de capas

- **Núcleo puro** (`src/lib/services/*`): validación y construcción de objetos como funciones puras → fácil de testear (TDD).
- **IO** (`src/lib/db.ts`): lectura/escritura de JSON, aislada del núcleo.
- **UI / rutas** (`src/app/*`): server actions y páginas.

## Consecuencias

- Los servicios reciben dependencias (now, generador de id) por parámetro para ser deterministas en tests.
- Los datos no son concurrencia-segura (un solo proceso de dev). Aceptable para el alcance.

## Alternativas consideradas

- SQLite/Prisma: más sólido, descartado por velocidad de hackathon (se eligió JSON).
- OAuth Google real: descartado, requiere credenciales; se simula el dominio corporativo.
