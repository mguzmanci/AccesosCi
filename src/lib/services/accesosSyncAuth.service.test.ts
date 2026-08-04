import { describe, expect, it } from 'vitest';
import { autorizarAccesosSync } from './accesosSyncAuth.service';

describe('autorizarAccesosSync', () => {
  it('autoriza cuando el header trae "Bearer <token>" igual al esperado', () => {
    expect(autorizarAccesosSync('Bearer secreto123', 'secreto123')).toBe(true);
  });

  it('rechaza cuando el token no coincide', () => {
    expect(autorizarAccesosSync('Bearer otro', 'secreto123')).toBe(false);
  });

  it('rechaza cuando falta el header', () => {
    expect(autorizarAccesosSync(null, 'secreto123')).toBe(false);
  });

  it('rechaza cuando el header no tiene el prefijo Bearer', () => {
    expect(autorizarAccesosSync('secreto123', 'secreto123')).toBe(false);
  });

  it('rechaza siempre si no hay token configurado en el servidor (evita quedar abierto por accidente)', () => {
    expect(autorizarAccesosSync('Bearer cualquier-cosa', undefined)).toBe(false);
    expect(autorizarAccesosSync('Bearer cualquier-cosa', '')).toBe(false);
  });
});
