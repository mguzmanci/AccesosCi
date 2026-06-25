import 'server-only';
import { cookies } from 'next/headers';
import type { Rol } from '@/types';

const COOKIE = 'sa_session';

export interface Sesion {
  email: string;
  nombre: string;
  rol: Rol;
  grupoBp?: string;
}

export async function getSesion(): Promise<Sesion | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Sesion;
  } catch {
    return null;
  }
}

export async function setSesion(sesion: Sesion): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, JSON.stringify(sesion), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 horas
  });
}

export async function clearSesion(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
