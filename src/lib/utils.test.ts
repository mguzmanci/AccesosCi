import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("combina clases simples", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("resuelve conflictos de tailwind dejando la última clase", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("ignora valores falsy", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });
});
