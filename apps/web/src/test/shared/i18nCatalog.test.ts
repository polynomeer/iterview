import { describe, expect, it } from "vitest";
import { catalog } from "../../shared/i18n/catalog";
import { formatMessage } from "../../shared/i18n/format";
import { messages } from "../../shared/i18n/messages";

describe("message catalog", () => {
  it.each(Object.entries(catalog))("%s has the same keys in Korean and English", (_namespace, entry) => {
    const { en, ko } = entry as { en: Record<string, string>; ko: Record<string, string> };
    expect(Object.keys(ko).sort()).toEqual(Object.keys(en).sort());
  });

  it("keeps every messages.ts namespace in parity too", () => {
    for (const namespace of Object.keys(messages.en)) {
      const en = Object.keys((messages.en as Record<string, object>)[namespace]).sort();
      const ko = Object.keys((messages.ko as Record<string, object>)[namespace] ?? {}).sort();
      expect({ namespace, keys: ko }).toEqual({ namespace, keys: en });
    }
  });

  it("merges catalog namespaces and fills placeholders", () => {
    expect(formatMessage("ko", "settingsPage.pageTitle")).toBe("설정");
    expect(formatMessage("en", "settingsPage.pageTitle")).toBe("Settings");
    expect(formatMessage("ko", "settingsPage.targetCount", { count: 3 })).toBe("목표 회사 3곳");
    expect(formatMessage("en", "settingsPage.targetCount")).toBe("{count} target companies");
  });
});
