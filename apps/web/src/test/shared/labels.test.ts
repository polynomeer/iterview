import { describe, expect, it } from "vitest";
import { difficultyLabel, materialTypeLabel, scoreTone, severityLabel, skillCategoryLabel, weaknessTagLabel, withSubjectParticle } from "../../shared/lib/labels";

describe("domain labels", () => {
  it("names weakness tags and material types, keeping unknown values readable", () => {
    expect(weaknessTagLabel("missing_metric", "ko")).toBe("수치 근거 없음");
    expect(weaknessTagLabel("missing_metrics", "en")).toBe("No numbers");
    expect(weaknessTagLabel("vague_scope", "en")).toBe("vague scope");
    expect(materialTypeLabel("article", "ko")).toBe("아티클");
    expect(materialTypeLabel(" Video ", "en")).toBe("Video");
    expect(materialTypeLabel("사내 위키", "ko")).toBe("사내 위키");
    expect(materialTypeLabel(null, "ko")).toBeNull();
  });


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

  it("picks the Korean subject particle from the final consonant", () => {
    expect(withSubjectParticle("구체성")).toBe("구체성이");
    expect(withSubjectParticle("구조")).toBe("구조가");
    expect(withSubjectParticle("Spring")).toBe("Spring이(가)");
  });
});
