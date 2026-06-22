import type {
  DatosBaja,
  DatosCreacion,
  DatosModificacion,
  Plataforma,
  Solicitud,
} from "@/types";

export const BUZON_ACCESOS = "accesos@capitalinteligente.cl";

export interface CorreoSimulado {
  to: string;
  subject: string;
  body: string;
}

function nombrePlataforma(id: string, plataformas: Plataforma[]): string {
  return plataformas.find((p) => p.id === id)?.nombre ?? id;
}

function bloqueDatos(solicitud: Solicitud): string {
  if (solicitud.tipo === "crear") {
    const d = solicitud.datos as DatosCreacion;
    return [
      `Nombres: ${d.nombres}`,
      `Apellidos: ${d.apellidos}`,
      `Teléfono: ${d.telefono}`,
      `Correo personal (envío de credenciales): ${d.correoPersonal}`,
    ].join("\n");
  }
  if (solicitud.tipo === "modificar") {
    const d = solicitud.datos as DatosModificacion;
    return [`Correo corporativo: ${d.correoCorporativo}`, `Detalle: ${d.detalle}`].join("\n");
  }
  const d = solicitud.datos as DatosBaja;
  const lineas = [`Correo corporativo a dar de baja: ${d.correoCorporativo}`];
  if (d.redistribucionSalesforce) {
    lineas.push(`Redistribución Salesforce (leads y cuentas): ${d.redistribucionSalesforce}`);
  }
  return lineas.join("\n");
}

/**
 * Construye el correo que históricamente se enviaba a accesos@capitalinteligente.cl.
 * En el MVP no se envía por SMTP: se muestra/loguea (notificación simulada).
 */
export function construirCorreoSolicitud(
  solicitud: Solicitud,
  plataformas: Plataforma[],
): CorreoSimulado {
  const tipo = solicitud.tipo.toUpperCase();
  const listaPlataformas = solicitud.accesos
    .map((a) => `- ${nombrePlataforma(a.plataformaId, plataformas)} (solicitado: ${a.fechaSolicitud})`)
    .join("\n");

  const body = [
    `Nueva solicitud de acceso (${tipo})`,
    `Solicitante: ${solicitud.solicitanteEmail}`,
    `Fecha: ${solicitud.fechaCreacion}`,
    "",
    "Datos:",
    bloqueDatos(solicitud),
    "",
    "Plataformas:",
    listaPlataformas,
  ].join("\n");

  return {
    to: BUZON_ACCESOS,
    subject: `[Solicitud ${tipo}] ${solicitud.solicitanteEmail}`,
    body,
  };
}
