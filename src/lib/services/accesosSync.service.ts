/**
 * Exporte de solo lectura del roster de asesores para la plataforma comercial
 * (ver docs/ADR sobre integración con Accesos). El `accesos_id` estable que
 * consume el otro sistema es el correo corporativo en minúsculas.
 */

export type RolAccesos = 'asesor' | 'tl' | 'bp';
export type EstadoAccesos = 'activo' | 'eliminado';

export interface AsesorRosterInput {
  correo: string;
  nombre: string;
  /** Label mostrado en la UI ("Activo" / "Eliminado"); no siempre refleja el flag global. */
  estado: string;
  tl: boolean;
  /** Flag global de eliminación (papelera / "Eliminados"), independiente del label de Estado. */
  eliminado?: boolean;
  /** La persona fue movida a otro grupo/MBP; esta fila ya no corresponde a un asesor vigente aquí. */
  transferido?: boolean;
  hojaId: string;
  hojaNombre: string;
  grupoNombre: string;
}

export interface UsuarioBpInput {
  email: string;
  rol: string;
}

export interface RosterEntryAccesos {
  id: string;
  nombre: string;
  email: string;
  rol: RolAccesos;
  reportaA: string;
  estado: EstadoAccesos;
}

function estadoEfectivo(a: AsesorRosterInput): EstadoAccesos {
  if (a.eliminado) return 'eliminado';
  return a.estado.trim().toLowerCase() === 'eliminado' ? 'eliminado' : 'activo';
}

export function construirRosterAccesos(
  asesores: AsesorRosterInput[],
  usuariosBp: UsuarioBpInput[],
): RosterEntryAccesos[] {
  const bpsPorEmail = new Set(
    usuariosBp.filter((u) => u.rol === 'bp').map((u) => u.email.toLowerCase()),
  );

  const roster = asesores
    .filter((a) => !a.transferido)
    .map((a) => {
      const correoNormalizado = a.correo.trim().toLowerCase();
      const rol: RolAccesos = bpsPorEmail.has(correoNormalizado) ? 'bp' : a.tl ? 'tl' : 'asesor';
      return {
        id: correoNormalizado,
        nombre: a.nombre,
        email: correoNormalizado,
        rol,
        reportaA: `${a.hojaNombre} · ${a.grupoNombre}`,
        estado: estadoEfectivo(a),
      };
    });

  return roster.sort((x, y) => x.id.localeCompare(y.id));
}
