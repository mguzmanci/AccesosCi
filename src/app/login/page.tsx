"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions";

const estadoInicial: { error?: string } = {};

export default function LoginPage() {
  const [estado, formAction, pending] = useActionState(loginAction, estadoInicial);

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">Solicitudes de Accesos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ingresa con tu cuenta @capitalinteligente.cl
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Correo corporativo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="tu.nombre@capitalinteligente.cl"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          {estado?.error && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400">
              {estado.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <div className="mt-6 rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <p className="font-medium">Cuentas de prueba:</p>
          <p>Equipo: accesos@capitalinteligente.cl / Capital26</p>
          <p>Solicitante: solicitante@capitalinteligente.cl / Capital26</p>
        </div>
      </div>
    </main>
  );
}
