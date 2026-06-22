"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  actualizarSolicitud,
  guardarSolicitud,
  leerPlataformas,
  leerSolicitudes,
  leerUsuarios,
} from "@/lib/db";
import { clearSesion, getSesion, setSesion } from "@/lib/session";
import { validarLogin } from "@/lib/services/auth.service";
import {
  cambiarEstadoSolicitud,
  crearSolicitud,
  validarEntradaSolicitud,
  type NuevaSolicitudInput,
} from "@/lib/services/solicitudes.service";
import { construirCorreoSolicitud } from "@/lib/services/notificaciones.service";
import type { DatosSolicitud, EstadoSolicitud, TipoSolicitud } from "@/types";

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const usuarios = await leerUsuarios();
  const usuario = validarLogin(usuarios, email, password);
  if (!usuario) {
    return { error: "Credenciales inválidas o dominio no autorizado." };
  }

  await setSesion({ email: usuario.email, nombre: usuario.nombre, rol: usuario.rol });
  redirect("/");
}

export async function logoutAction() {
  await clearSesion();
  redirect("/login");
}

export async function crearSolicitudAction(_prev: unknown, formData: FormData) {
  const sesion = await getSesion();
  if (!sesion) redirect("/login");

  const tipo = String(formData.get("tipo") ?? "crear") as TipoSolicitud;
  const plataformaIds = formData.getAll("plataformas").map(String);

  let datos: DatosSolicitud;
  if (tipo === "crear") {
    datos = {
      nombres: String(formData.get("nombres") ?? ""),
      apellidos: String(formData.get("apellidos") ?? ""),
      telefono: String(formData.get("telefono") ?? ""),
      correoPersonal: String(formData.get("correoPersonal") ?? ""),
    };
  } else if (tipo === "modificar") {
    datos = {
      correoCorporativo: String(formData.get("correoCorporativo") ?? ""),
      detalle: String(formData.get("detalle") ?? ""),
    };
  } else {
    datos = {
      correoCorporativo: String(formData.get("correoCorporativo") ?? ""),
      redistribucionSalesforce:
        String(formData.get("redistribucionSalesforce") ?? "") || undefined,
    };
  }

  const input: NuevaSolicitudInput = {
    tipo,
    solicitanteEmail: sesion.email,
    datos,
    plataformaIds,
  };

  const errores = validarEntradaSolicitud(input);
  if (errores.length > 0) {
    return { error: errores.join(" ") };
  }

  const solicitud = crearSolicitud(input, {
    now: () => new Date(),
    generarId: () => `sol_${randomUUID().slice(0, 8)}`,
  });
  await guardarSolicitud(solicitud);

  // Notificación simulada: se construye y se loguea el correo que se enviaría.
  const plataformas = await leerPlataformas();
  const correo = construirCorreoSolicitud(solicitud, plataformas);
  console.info("[CORREO SIMULADO]\n", correo.to, "\n", correo.subject, "\n", correo.body);

  revalidatePath("/");
  redirect("/?creada=1");
}

export async function cambiarEstadoAction(formData: FormData) {
  const sesion = await getSesion();
  if (!sesion || sesion.rol !== "equipo") {
    throw new Error("No autorizado.");
  }

  const id = String(formData.get("id") ?? "");
  const estado = String(formData.get("estado") ?? "") as EstadoSolicitud;
  const correoCorporativoAsignado = String(
    formData.get("correoCorporativoAsignado") ?? "",
  ).trim();

  const solicitudes = await leerSolicitudes();
  const solicitud = solicitudes.find((s) => s.id === id);
  if (!solicitud) throw new Error(`Solicitud no encontrada: ${id}`);

  if (solicitud.tipo === "crear" && estado === "completada" && !correoCorporativoAsignado) {
    throw new Error(
      "Debe indicar el correo @capitalinteligente.cl asignado para completar la creación.",
    );
  }

  const actualizada = cambiarEstadoSolicitud(solicitud, estado);
  await actualizarSolicitud(
    correoCorporativoAsignado ? { ...actualizada, correoCorporativoAsignado } : actualizada,
  );
  revalidatePath("/");
}
