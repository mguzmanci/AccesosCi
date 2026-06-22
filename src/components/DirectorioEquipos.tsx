import type { Plataforma, PersonaDirectorio } from "@/types";
import { DashboardTabs } from "@/components/DashboardTabs";

function nombrePlataforma(id: string, plataformas: Plataforma[]): string {
  return plataformas.find((p) => p.id === id)?.nombre ?? id;
}

function fmtFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function DirectorioEquipos({
  directorio,
  plataformas,
}: {
  directorio: PersonaDirectorio[];
  plataformas: Plataforma[];
}) {
  const activos = directorio.filter((p) => p.estado === "activo");
  const eliminados = directorio.filter((p) => p.estado === "eliminado");

  return (
    <DashboardTabs
      tabs={[
        {
          id: "activos",
          label: "Activos",
          badge: activos.length,
          content: <ListaPersonas personas={activos} plataformas={plataformas} />,
        },
        {
          id: "eliminados",
          label: "Eliminados",
          badge: eliminados.length,
          content: <ListaPersonas personas={eliminados} plataformas={plataformas} />,
        },
      ]}
    />
  );
}

function ListaPersonas({
  personas,
  plataformas,
}: {
  personas: PersonaDirectorio[];
  plataformas: Plataforma[];
}) {
  if (personas.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        No hay personas en esta categoría.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {personas.map((persona) => (
        <li key={persona.correoCorporativo} className="rounded-xl border border-border bg-card p-5">
          <p className="font-medium text-foreground">{persona.correoCorporativo}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {persona.accesos.map((a) => (
              <span
                key={a.plataformaId}
                title={`Solicitado: ${fmtFecha(a.fechaSolicitud)}`}
                className={`rounded-md border px-2 py-0.5 text-xs ${
                  a.estado === "activo"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                    : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400"
                }`}
              >
                {nombrePlataforma(a.plataformaId, plataformas)} · {fmtFecha(a.fechaSolicitud)}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
