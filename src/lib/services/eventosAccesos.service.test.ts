import { describe, expect, it } from 'vitest';
import { mapearEventosAccesos, tipoEvento, type HistorialEntryConCursor } from './eventosAccesos.service';

function entry(overrides: Partial<HistorialEntryConCursor> = {}): HistorialEntryConCursor {
  return {
    id: 'uuid-1',
    secuencia: 1,
    correo: 'Ana@CapitalInteligente.cl',
    campo: 'comentario',
    valorAnterior: 'a',
    valorNuevo: 'b',
    usuarioEmail: 'tmallea@capitalinteligente.cl',
    creadoEn: '2026-08-01T10:00:00.000Z',
    ...overrides,
  };
}

describe('tipoEvento', () => {
  it('es "creacion" cuando el campo es alta', () => {
    expect(tipoEvento('alta', 'MBP Guzmán · Avanti')).toBe('creacion');
  });

  it('es "eliminacion" cuando el campo estado pasa a Eliminado', () => {
    expect(tipoEvento('estado', 'Eliminado')).toBe('eliminacion');
  });

  it('es "eliminacion" cuando el flag global eliminado se activa', () => {
    expect(tipoEvento('eliminado', 'true')).toBe('eliminacion');
  });

  it('es "modificacion" para cualquier otro campo', () => {
    expect(tipoEvento('jira', 'true')).toBe('modificacion');
    expect(tipoEvento('comentario', 'algo')).toBe('modificacion');
  });
});

describe('mapearEventosAccesos', () => {
  it('usa el correo en minúsculas como correoId (mismo accesos_id que el roster)', () => {
    const [evento] = mapearEventosAccesos([entry()]);
    expect(evento.correoId).toBe('ana@capitalinteligente.cl');
  });

  it('expone la secuencia numérica como cursor incremental', () => {
    const [evento] = mapearEventosAccesos([entry({ secuencia: 42 })]);
    expect(evento.cursor).toBe(42);
  });

  it('preserva timestamp, valores y clasifica el tipo', () => {
    const [evento] = mapearEventosAccesos([
      entry({ campo: 'estado', valorAnterior: 'Activo', valorNuevo: 'Eliminado' }),
    ]);
    expect(evento).toMatchObject({
      tipo: 'eliminacion',
      campo: 'estado',
      valorAnterior: 'Activo',
      valorNuevo: 'Eliminado',
      timestamp: '2026-08-01T10:00:00.000Z',
    });
  });

  it('mantiene el orden de entrada (el llamador ya ordenó por secuencia ascendente)', () => {
    const eventos = mapearEventosAccesos([
      entry({ secuencia: 1 }),
      entry({ secuencia: 2 }),
      entry({ secuencia: 3 }),
    ]);
    expect(eventos.map((e) => e.cursor)).toEqual([1, 2, 3]);
  });
});
