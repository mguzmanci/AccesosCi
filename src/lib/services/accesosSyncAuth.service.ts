import { timingSafeEqual } from 'crypto';

/**
 * Autorización del endpoint de solo lectura para la plataforma comercial:
 * header `Authorization: Bearer <ACCESOS_SYNC_TOKEN>`. Es un secreto propio
 * de esta integración, NUNCA las credenciales de Supabase ni la cookie de
 * sesión de usuarios (ver ADR 001).
 */
export function autorizarAccesosSync(
  authHeader: string | null | undefined,
  tokenEsperado: string | undefined,
): boolean {
  if (!tokenEsperado) return false;
  if (!authHeader?.startsWith('Bearer ')) return false;
  const recibido = authHeader.slice('Bearer '.length);
  const bufRecibido = Buffer.from(recibido);
  const bufEsperado = Buffer.from(tokenEsperado);
  if (bufRecibido.length !== bufEsperado.length) return false;
  return timingSafeEqual(bufRecibido, bufEsperado);
}
