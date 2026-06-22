# 001 - Setup inicial del proyecto

## Contexto

Se necesita una app para gestionar "Solicitudes de Accesos". Se busca estandarizar tooling desde el día uno usando DevGround.

## Decisión

- Next.js (App Router) + TypeScript + Tailwind CSS v4.
- Gestor de paquetes: pnpm.
- Testing: Vitest + Testing Library (unit/integration), TDD estricto.
- Estándares de código, commits y reglas de agentes IA vía `@devground/devground`.

## Consecuencias

- Toda lógica no trivial requiere test antes de implementación.
- Commits deben seguir Conventional Commits.
- UI debe usar tokens semánticos (`bg-card`, `bg-background`, etc.) y el helper `cn()`.

## Alternativas consideradas

- Create React App / Vite puro: descartado, Next.js da SSR/routing out of the box.
- Jest: descartado en favor de Vitest por mejor integración con Vite/Next y velocidad.
