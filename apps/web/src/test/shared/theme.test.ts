import { describe, expect, it } from "vitest";
import { defaultTheme, getStoredTheme, themeOptions } from "../../shared/theme/theme";

function storageWith(value: string | null) {
  return { getItem: () => value };
}

describe("theme", () => {
  it("defaults to the workspace theme", () => {
    expect(defaultTheme).toBe("workspace");
    expect(getStoredTheme(storageWith(null))).toBe("workspace");
  });

  it("migrates the retired light theme to the default", () => {
    expect(themeOptions.map((option) => option.id)).not.toContain("light");
    expect(getStoredTheme(storageWith("light"))).toBe("workspace");
  });

  it("keeps a stored theme that is still offered", () => {
    expect(getStoredTheme(storageWith("dark"))).toBe("dark");
  });
});
