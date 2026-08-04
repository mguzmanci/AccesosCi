/**
 * Traduce correos_historial (log de ediciones de campo, ya existente para la
 * pestaña "Historial") a eventos tipados que la plataforma comercial pueda
 * consumir de forma incremental (sección 1 del plan: tipo de evento,
 * timestamp, diff de campos, cursor incremental).
 *
 * El cursor NO puede ser el `id` (uuid, no ordenable) — se usa `secuencia`,
 * una columna bigserial agregada para este propósito (ver migración en
 * docs/migrations o el SQL entregado junto con esta feature).
 */

export type TipoEventoAccesos = 'creacion' | 'modificacion' | 'eliminacion';

export interface HistorialEntryConCursor {
  id: string;
  secuencia: number;
  correo: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string;
  usuarioEmail: string;
  creadoEn: string;
}

export interface EventoAccesos {
  cursor: number;
  correoId: string;
  tipo: TipoEventoAccesos;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string;
  usuarioEmail: string;
  timestamp: string;
}

export function tipoEvento(campo: string, valorNuevo: string): TipoEventoAccesos {
  if (campo === 'alta') return 'creacion';
  if (campo === 'estado' && valorNuevo.toLowerCase() === 'eliminado') return 'eliminacion';
  if (campo === 'eliminado' && valorNuevo === 'true') return 'eliminacion';
  return 'modificacion';
}

export function mapearEventosAccesos(entries: HistorialEntryConCursor[]): EventoAccesos[] {
  return entries.map((e) => ({
    cursor: e.secuencia,
    correoId: e.correo.trim().toLowerCase(),
    tipo: tipoEvento(e.campo, e.valorNuevo),
    campo: e.campo,
    valorAnterior: e.valorAnterior,
    valorNuevo: e.valorNuevo,
    usuarioEmail: e.usuarioEmail,
    timestamp: e.creadoEn,
  }));
}
