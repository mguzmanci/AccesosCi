import { NextRequest, NextResponse } from 'next/server';
import { autorizarAccesosSync } from '@/lib/services/accesosSyncAuth.service';
import { obtenerRosterAccesos } from '@/lib/directorio';

/**
 * Roster de solo lectura para la plataforma comercial (ver ADR 001).
 * Protegido por token compartido, no por sesión de usuario ni credenciales
 * de Supabase.
 */
export async function GET(req: NextRequest) {
  const autorizado = autorizarAccesosSync(
    req.headers.get('authorization'),
    process.env.ACCESOS_SYNC_TOKEN,
  );
  if (!autorizado) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  try {
    const roster = await obtenerRosterAccesos();
    return NextResponse.json({ roster });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[accesos-sync/roster]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
