import { describe, expect, test } from "bun:test";
import { normalizeError } from "../errors";

// Helper to construct a mock Axios error
function createAxiosError(status?: number, data?: any): any {
  const error: any = new Error("Axios Error");
  error.isAxiosError = true;
  if (status !== undefined || data !== undefined) {
    error.response = {
      status,
      data,
      headers: {},
      config: {},
    };
  }
  return error;
}

describe("normalizeError", () => {
  test("returns generic error for non-axios errors", () => {
    const error = new Error("Some standard error");
    const result = normalizeError(error);
    expect(result.status).toBeNull();
    expect(result.message).toBe("Algo salió mal. Intenta de nuevo.");
  });

  test("returns network error when there is no response", () => {
    const error = createAxiosError(); // isAxiosError = true, no response
    const result = normalizeError(error);
    expect(result.status).toBeNull();
    expect(result.message).toBe("No se pudo conectar. Revisa tu conexión e intenta de nuevo.");
  });

  test("handles 422 validation errors with field errors mapping", () => {
    const detail = [
      { loc: ["body", "email"], msg: "El correo electrónico no es válido" },
      { loc: ["body", "password"], msg: "La contraseña es muy corta" },
      { loc: ["body", "store_name"], msg: "El nombre de la tienda es requerido" }
    ];
    const error = createAxiosError(422, { detail });
    const result = normalizeError(error);
    
    expect(result.status).toBe(422);
    expect(result.message).toBe("Revisa los datos ingresados.");
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.email).toBe("El correo electrónico no es válido");
    expect(result.fieldErrors?.password).toBe("La contraseña es muy corta");
    expect(result.fieldErrors?.store_name).toBe("El nombre de la tienda es requerido");
  });

  test("handles 404 error with standard detail message", () => {
    const error = createAxiosError(404, { detail: "El recurso solicitado no fue encontrado." });
    const result = normalizeError(error);
    expect(result.status).toBe(404);
    expect(result.message).toBe("El recurso solicitado no fue encontrado.");
  });

  test("handles 409 conflict error with standard detail message", () => {
    const error = createAxiosError(409, { detail: "Este correo electrónico ya está registrado." });
    const result = normalizeError(error);
    expect(result.status).toBe(409);
    expect(result.message).toBe("Este correo electrónico ya está registrado.");
  });

  test("handles 500 server error with standard detail message or falls back to generic", () => {
    const error = createAxiosError(500, { detail: "Error interno del servidor." });
    const result = normalizeError(error);
    expect(result.status).toBe(500);
    expect(result.message).toBe("Error interno del servidor.");

    const errorFallback = createAxiosError(500, {});
    const resultFallback = normalizeError(errorFallback);
    expect(resultFallback.status).toBe(500);
    expect(resultFallback.message).toBe("Algo salió mal. Intenta de nuevo.");
  });
});
