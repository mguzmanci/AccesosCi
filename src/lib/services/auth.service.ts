import { createHash } from "crypto";
import type { Usuario } from "@/types";

export const DOMINIO_CORPORATIVO = "capitalinteligente.cl";

function normalizar(email: string): string {
  return email.trim().toLowerCase();
}

export function esCorreoCorporativo(email: string): boolean {
  return normalizar(email).endsWith(`@${DOMINIO_CORPORATIVO}`);
}

/**
 * Hash simple para el login del MVP. NO es seguro para producción
 * (no usa salt ni un KDF lento); suficiente para la demo del hackathon.
 */
export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function validarLogin(
  usuarios: Usuario[],
  email: string,
  password: string,
): Usuario | null {
  if (!esCorreoCorporativo(email)) return null;
  const correo = normalizar(email);
  const usuario = usuarios.find((u) => normalizar(u.email) === correo);
  if (!usuario) return null;
  if (usuario.passwordHash !== hashPassword(password)) return null;
  return usuario;
}
