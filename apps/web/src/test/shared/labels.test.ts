import { describe, expect, it } from "vitest";
import { difficultyLabel, scoreTone, severityLabel, skillCategoryLabel } from "../../shared/lib/labels";

describe("domain labels", () => {
  it("localizes difficulty codes and passes unknown values through", () => {
    expect(difficultyLabel("MEDIUM", "ko")).toBe("보통");
    expect(difficultyLabel("hard", "en")).toBe("Hard");
    expect(difficultyLabel("EXPERT", "ko")).toBe("EXPERT");
    expect(difficultyLabel(null, "ko")).toBeNull();
  });

  it("localizes skill categories and title-cases unknown codes", () => {
    expect(skillCategoryLabel("SYSTEM_DESIGN", "ko")).toBe("시스템 설계");
    expect(skillCategoryLabel("CLOUD_NATIVE", "en")).toBe("Cloud Native");
  });

  it("maps scores to tones at 50 and 75", () => {
    expect([scoreTone(49), scoreTone(50), scoreTone(74), scoreTone(75), scoreTone(null)]).toEqual([
      "danger",
      "warning",
      "warning",
      "success",
      "neutral",
    ]);
  });

  it("pairs severity words with tones", () => {
    expect(severityLabel("high", "ko")).toEqual({ label: "높음", tone: "danger" });
    expect(severityLabel("medium", "en")).toEqual({ label: "Medium", tone: "warning" });
    expect(severityLabel("unknown", "ko")).toEqual({ label: "unknown", tone: "neutral" });
  });
});
