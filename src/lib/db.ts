import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Plataforma, Solicitud, Usuario } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");

async function leerJson<T>(archivo: string): Promise<T> {
  const ruta = path.join(DATA_DIR, archivo);
  const contenido = await fs.readFile(ruta, "utf-8");
  return JSON.parse(contenido) as T;
}

async function escribirJson<T>(archivo: string, datos: T): Promise<void> {
  const ruta = path.join(DATA_DIR, archivo);
  await fs.writeFile(ruta, JSON.stringify(datos, null, 2) + "\n", "utf-8");
}

export function leerUsuarios(): Promise<Usuario[]> {
  return leerJson<Usuario[]>("usuarios.json");
}

export function leerPlataformas(): Promise<Plataforma[]> {
  return leerJson<Plataforma[]>("plataformas.json");
}

export function leerSolicitudes(): Promise<Solicitud[]> {
  return leerJson<Solicitud[]>("solicitudes.json");
}

export async function guardarSolicitud(solicitud: Solicitud): Promise<void> {
  const solicitudes = await leerSolicitudes();
  solicitudes.unshift(solicitud);
  await escribirJson("solicitudes.json", solicitudes);
}

export async function actualizarSolicitud(actualizada: Solicitud): Promise<void> {
  const solicitudes = await leerSolicitudes();
  const idx = solicitudes.findIndex((s) => s.id === actualizada.id);
  if (idx === -1) throw new Error(`Solicitud no encontrada: ${actualizada.id}`);
  solicitudes[idx] = actualizada;
  await escribirJson("solicitudes.json", solicitudes);
}
