import { describe, expect, it } from "vitest";
import { defaultPalette, defaultTheme, getStoredPalette, getStoredTheme, paletteOptions, themeOptions } from "../../shared/theme/theme";

function storageWith(value: string | null) {
  return { getItem: () => value };
}

describe("theme", () => {
  it("offers system, light, and dark, and follows the OS by default (ADR 0082)", () => {
    expect(themeOptions.map((option) => option.id)).toEqual(["system", "light", "dark"]);
    expect(defaultTheme).toBe("system");
    expect(getStoredTheme(storageWith(null))).toBe("system");
    expect(getStoredTheme(storageWith("not-a-theme"))).toBe("system");
  });

  it("keeps retired dark palettes dark", () => {
    expect(getStoredTheme(storageWith("workspace"))).toBe("dark");
    expect(getStoredTheme(storageWith("dracula"))).toBe("dark");
  });

  it("keeps a stored theme that is still offered", () => {
    expect(getStoredTheme(storageWith("light"))).toBe("light");
    expect(getStoredTheme(storageWith("dark"))).toBe("dark");
  });

  it("uses Ink & Signal unless the classic palette was chosen (ADR 0094)", () => {
    expect(paletteOptions.map((option) => option.id)).toEqual(["ink", "classic"]);
    expect(defaultPalette).toBe("ink");
    expect(getStoredPalette(storageWith(null))).toBe("ink");
    expect(getStoredPalette(storageWith("dracula"))).toBe("ink");
    expect(getStoredPalette(storageWith("classic"))).toBe("classic");
  });
});
