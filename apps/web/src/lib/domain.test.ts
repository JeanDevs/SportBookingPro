import { describe, it, expect } from "vitest";
import { humanizeRpcError, RPC_ERROR_MESSAGES } from "./domain";

describe("humanizeRpcError", () => {
  it("traduce un código conocido contenido en el mensaje de Postgres", () => {
    expect(humanizeRpcError('new row ... SLOT_TAKEN')).toBe(RPC_ERROR_MESSAGES.SLOT_TAKEN);
    expect(humanizeRpcError("AUTH_REQUIRED")).toBe(RPC_ERROR_MESSAGES.AUTH_REQUIRED);
  });
  it("usa un mensaje genérico ante null o desconocido", () => {
    expect(humanizeRpcError(null)).toContain("error");
    expect(humanizeRpcError("algo raro")).toContain("error");
  });
});
