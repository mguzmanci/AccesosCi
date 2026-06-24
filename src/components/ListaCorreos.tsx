'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import correosData from '@/data/correos.json';

interface Asesor {
  nombre: string;
  correo: string;
  estado: string;
  jira: boolean;
  slack: boolean;
  sf: string;
  tl: boolean;
  fechaEliminacion?: string;
}

interface Grupo {
  nombre: string;
  asesores: Asesor[];
  metricas: { label: string; valor: number }[];
}

interface Hoja {
  id: string;
  nombre: string;
  grupos: Grupo[];
}

const data = correosData as { actualizado: string; hojas: Hoja[] };

function etiquetaHoja(nombre: string): string {
  return nombre.replace(/^MBP\s+/, '');
}

function Check({ on }: { on: boolean }) {
  return on ? (
    <span className="text-emerald-600 dark:text-emerald-400">✓</span>
  ) : (
    <span className="text-muted-foreground/40">—</span>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const activo = estado.toLowerCase() === 'activo';
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
        activo
          ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
          : 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400',
      )}
    >
      {estado || '—'}
    </span>
  );
}

function TablaGrupo({
  grupo,
  columnas,
}: {
  grupo: Grupo;
  columnas: { jira: boolean; slack: boolean; sf: boolean; fecha: boolean };
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">{grupo.nombre}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {grupo.asesores.length}
        </span>
        {grupo.metricas.map((m) => (
          <span
            key={m.label}
            className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-400"
          >
            {m.label}: <strong>{m.valor}</strong>
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-3 py-2 font-semibold text-foreground">Nombre</th>
              <th className="px-3 py-2 font-semibold text-foreground">Correo</th>
              <th className="px-3 py-2 font-semibold text-foreground">Estado</th>
              {columnas.jira && (
                <th className="px-3 py-2 text-center font-semibold text-foreground">Jira</th>
              )}
              {columnas.slack && (
                <th className="px-3 py-2 text-center font-semibold text-foreground">Slack</th>
              )}
              {columnas.sf && (
                <th className="px-3 py-2 font-semibold text-foreground">Salesforce</th>
              )}
              {columnas.fecha && <th className="px-3 py-2 font-semibold text-foreground">Baja</th>}
            </tr>
          </thead>
          <tbody>
            {grupo.asesores.map((a, i) => (
              <tr
                key={`${a.correo}-${i}`}
                className="border-b border-border last:border-0 hover:bg-muted/30"
              >
                <td className="px-3 py-2 text-foreground">
                  {a.nombre}
                  {a.tl && (
                    <span className="ml-1.5 rounded bg-amber-100 px-1 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                      T.L
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{a.correo}</td>
                <td className="px-3 py-2">
                  <EstadoBadge estado={a.estado} />
                </td>
                {columnas.jira && (
                  <td className="px-3 py-2 text-center">
                    <Check on={a.jira} />
                  </td>
                )}
                {columnas.slack && (
                  <td className="px-3 py-2 text-center">
                    <Check on={a.slack} />
                  </td>
                )}
                {columnas.sf && <td className="px-3 py-2 text-muted-foreground">{a.sf || '—'}</td>}
                {columnas.fecha && (
                  <td className="px-3 py-2 text-muted-foreground">{a.fechaEliminacion ?? '—'}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ListaCorreos() {
  const [hojaActiva, setHojaActiva] = useState(data.hojas[0]?.id);
  const [busqueda, setBusqueda] = useState('');

  const hoja = data.hojas.find((h) => h.id === hojaActiva) ?? data.hojas[0];

  const grupos = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return hoja.grupos;
    return hoja.grupos
      .map((g) => ({
        ...g,
        asesores: g.asesores.filter(
          (a) => a.nombre.toLowerCase().includes(q) || a.correo.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.asesores.length > 0);
  }, [hoja, busqueda]);

  // Qué columnas tienen datos en esta hoja (oculta las vacías, p.ej. en Planta).
  const columnas = useMemo(() => {
    const all = hoja.grupos.flatMap((g) => g.asesores);
    return {
      jira: all.some((a) => a.jira),
      slack: all.some((a) => a.slack),
      sf: all.some((a) => a.sf),
      fecha: all.some((a) => a.fechaEliminacion),
    };
  }, [hoja]);

  const totalHoja = hoja.grupos.reduce((n, g) => n + g.asesores.length, 0);
  const totalGeneral = data.hojas.reduce(
    (n, h) => n + h.grupos.reduce((m, g) => m + g.asesores.length, 0),
    0,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {totalGeneral} correos en {data.hojas.length} hojas · actualizado {data.actualizado}
        </p>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o correo…"
          className="w-56 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Tabs por hoja */}
      <div className="flex flex-wrap gap-1 border-b border-border">
        {data.hojas.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => setHojaActiva(h.id)}
            className={cn(
              'border-b-2 px-3 py-1.5 text-sm font-medium transition-colors',
              hojaActiva === h.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {etiquetaHoja(h.nombre)}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {hoja.nombre} · {totalHoja} correos · {hoja.grupos.length} equipo
        {hoja.grupos.length !== 1 ? 's' : ''}
      </p>

      {/* Subtablas por grupo */}
      <div className="space-y-6">
        {grupos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            Sin resultados para «{busqueda}».
          </p>
        ) : (
          grupos.map((g) => <TablaGrupo key={g.nombre} grupo={g} columnas={columnas} />)
        )}
      </div>
    </div>
  );
}
