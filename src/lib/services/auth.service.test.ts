import { describe, expect, it } from "vitest";
import type { Usuario } from "@/types";
import { esCorreoCorporativo, validarLogin, hashPassword } from "./auth.service";

const usuarios: Usuario[] = [
  {
    email: "ana@capitalinteligente.cl",
    nombre: "Ana",
    rol: "equipo",
    passwordHash: hashPassword("secreta"),
  },
];

describe("esCorreoCorporativo", () => {
  it("acepta correos del dominio corporativo", () => {
    expect(esCorreoCorporativo("juan@capitalinteligente.cl")).toBe(true);
  });

  it("rechaza otros dominios", () => {
    expect(esCorreoCorporativo("juan@gmail.com")).toBe(false);
  });

  it("es insensible a mayúsculas y espacios", () => {
    expect(esCorreoCorporativo("  Juan@CapitalInteligente.CL ")).toBe(true);
  });
});

describe("validarLogin", () => {
  it("autentica con credenciales correctas", () => {
    const u = validarLogin(usuarios, "ana@capitalinteligente.cl", "secreta");
    expect(u?.rol).toBe("equipo");
  });

  it("rechaza password incorrecta", () => {
    expect(validarLogin(usuarios, "ana@capitalinteligente.cl", "mala")).toBeNull();
  });

  it("rechaza usuario inexistente", () => {
    expect(validarLogin(usuarios, "nadie@capitalinteligente.cl", "x")).toBeNull();
  });

  it("rechaza correo de dominio no corporativo aunque coincida", () => {
    expect(validarLogin(usuarios, "ana@gmail.com", "secreta")).toBeNull();
  });
});
