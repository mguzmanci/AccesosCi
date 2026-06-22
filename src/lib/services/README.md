# Services

Índice de servicios de negocio (lógica desacoplada de la UI y de las rutas).

| Servicio | Qué resuelve |
|----------|--------------|
| _(sin servicios aún)_ | |

## Convenciones

- Un archivo por dominio (ej. `solicitudes.service.ts`).
- Funciones puras cuando sea posible; efectos (DB, fetch) explícitos.
- Cada función pública exportada debe tener su test correspondiente en `tests/`.
