import { describe, expect, it } from 'vitest';
import { construirRosterAccesos, type AsesorRosterInput } from './accesosSync.service';

function asesor(overrides: Partial<AsesorRosterInput> = {}): AsesorRosterInput {
  return {
    correo: 'persona@capitalinteligente.cl',
    nombre: 'Persona de Prueba',
    estado: 'Activo',
    tl: false,
    eliminado: false,
    hojaId: 'hoja-1',
    hojaNombre: 'MBP Martín Guzmán',
    grupoNombre: 'Avanti',
    ...overrides,
  };
}

describe('construirRosterAccesos', () => {
  it('usa el correo en minúsculas como id estable (accesos_id)', () => {
    const roster = construirRosterAccesos([asesor({ correo: 'Persona@CapitalInteligente.cl' })], []);
    expect(roster[0].id).toBe('persona@capitalinteligente.cl');
  });

  it('arma "reportaA" como Hoja (MBP) · Grupo (BP)', () => {
    const roster = construirRosterAccesos([asesor()], []);
    expect(roster[0].reportaA).toBe('MBP Martín Guzmán · Avanti');
  });

  it('marca rol "tl" cuando el asesor es team lead', () => {
    const roster = construirRosterAccesos([asesor({ tl: true })], []);
    expect(roster[0].rol).toBe('tl');
  });

  it('marca rol "bp" cuando la persona es un usuario con rol bp para ese grupo', () => {
    const roster = construirRosterAccesos([asesor({ tl: true })], [
      { email: 'persona@capitalinteligente.cl', rol: 'bp' },
    ]);
    expect(roster[0].rol).toBe('bp');
  });

  it('rol por defecto es "asesor"', () => {
    const roster = construirRosterAccesos([asesor()], []);
    expect(roster[0].rol).toBe('asesor');
  });

  it('estado "eliminado" cuando el flag global eliminado está activo, sin importar el label de Estado', () => {
    const roster = construirRosterAccesos(
      [asesor({ estado: 'Activo', eliminado: true })],
      [],
    );
    expect(roster[0].estado).toBe('eliminado');
  });

  it('estado "eliminado" cuando el label Estado es Eliminado aunque el flag global no esté seteado', () => {
    const roster = construirRosterAccesos(
      [asesor({ estado: 'Eliminado', eliminado: false })],
      [],
    );
    expect(roster[0].estado).toBe('eliminado');
  });

  it('estado "activo" en el caso normal', () => {
    const roster = construirRosterAccesos([asesor()], []);
    expect(roster[0].estado).toBe('activo');
  });

  it('excluye a los transferidos (ya no pertenecen a este grupo, no son una persona nueva)', () => {
    const roster = construirRosterAccesos([asesor({ transferido: true })], []);
    expect(roster).toHaveLength(0);
  });

  it('ordena el resultado alfabéticamente por email para que la paginación del consumidor sea estable', () => {
    const roster = construirRosterAccesos(
      [
        asesor({ correo: 'zeta@capitalinteligente.cl', nombre: 'Zeta' }),
        asesor({ correo: 'alfa@capitalinteligente.cl', nombre: 'Alfa' }),
      ],
      [],
    );
    expect(roster.map((r) => r.id)).toEqual([
      'alfa@capitalinteligente.cl',
      'zeta@capitalinteligente.cl',
    ]);
  });
});
