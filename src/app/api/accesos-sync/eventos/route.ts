import { NextRequest, NextResponse } from 'next/server';
import { autorizarAccesosSync } from '@/lib/services/accesosSyncAuth.service';
import { leerEventosAccesosDesde } from '@/lib/db';
import { mapearEventosAccesos } from '@/lib/services/eventosAccesos.service';

/**
 * Eventos incrementales para la plataforma comercial (ver ADR 001).
 * Uso: GET /api/accesos-sync/eventos?cursor=<ultima_secuencia_leida>
 * (cursor=0 o ausente trae todo el historial desde el principio).
 * Protegido por token compartido, no por sesión de usuario.
 */
export async function GET(req: NextRequest) {
  const autorizado = autorizarAccesosSync(
    req.headers.get('authorization'),
    process.env.ACCESOS_SYNC_TOKEN,
  );
  if (!autorizado) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const cursorParam = req.nextUrl.searchParams.get('cursor');
  const cursor = Number(cursorParam ?? 0);
  if (!Number.isFinite(cursor) || cursor < 0) {
    return NextResponse.json({ error: 'cursor inválido.' }, { status: 400 });
  }

  try {
    const entradas = await leerEventosAccesosDesde(cursor);
    const eventos = mapearEventosAccesos(entradas);
    const cursorSiguiente = eventos.length > 0 ? eventos[eventos.length - 1].cursor : cursor;
    return NextResponse.json({ eventos, cursorSiguiente });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[accesos-sync/eventos]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
