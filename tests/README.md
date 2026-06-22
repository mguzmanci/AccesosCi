# Tests

Este proyecto sigue TDD estricto (ver `CLAUDE.md`, regla #1).

## Cómo correr los tests

```bash
pnpm test        # corre toda la suite una vez
pnpm test:watch  # modo watch
```

## Estructura

```
tests/
├── unit/         # funciones puras, utils, helpers
├── integration/  # servicios, contratos de API
└── e2e/          # flujos críticos de punta a punta
```

Cada archivo de test debe vivir junto al módulo que prueba o en la carpeta equivalente dentro de `tests/`, con el sufijo `.test.ts(x)`.
