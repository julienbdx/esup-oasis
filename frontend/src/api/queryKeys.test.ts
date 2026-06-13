import { describe, it, expect } from "vitest";
import * as QK from "./queryKeys";

// ---------------------------------------------------------------------------
// Contrat de non-régression sur les clés de cache React Query.
// Une collision ou une clé vide invaliderait silencieusement plusieurs
// requêtes à la fois (le mécanisme d'invalidation se base sur startsWith).
// ---------------------------------------------------------------------------

describe("queryKeys", () => {
  const entries = Object.entries(QK) as [string, string][];

  it("toutes les constantes QK_* sont des chaînes non vides", () => {
    expect(entries.length).toBeGreaterThan(0);
    for (const [name, value] of entries) {
      expect(typeof value, `${name} doit être une string`).toBe("string");
      expect(value.length, `${name} ne doit pas être vide`).toBeGreaterThan(0);
    }
  });

  it("toutes les constantes QK_* sont uniques (pas de doublon)", () => {
    const values = entries.map(([, v]) => v);
    const unique = new Set(values);
    if (unique.size !== values.length) {
      const seen = new Set<string>();
      const duplicates = values.filter((v) => (seen.has(v) ? true : !seen.add(v)));
      throw new Error(`Doublons détectés : ${duplicates.join(", ")}`);
    }
    expect(unique.size).toBe(values.length);
  });
});
