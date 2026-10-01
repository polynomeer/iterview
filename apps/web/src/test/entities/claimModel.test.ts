import { describe, expect, it } from "vitest";
import { mapClaimEvidence } from "../../entities/resume/model";
import { claimHeatmapItem, evidenceStatus, riskiestEmptyField, type Claim, type HeatmapItem } from "../../pages/resume-claims/claimModel";

function claim(overrides: Partial<Claim> = {}): Claim {
  return { id: "a1", title: "Led the migration", impactSummary: "", evidence: mapClaimEvidence(null), ...overrides };
}

describe("claimModel", () => {
  it("derives the evidence status from the four answers", () => {
    expect(evidenceStatus(mapClaimEvidence(null))).toBe("empty");
    expect(evidenceStatus(mapClaimEvidence({ roleText: "  " }))).toBe("empty");
    expect(evidenceStatus(mapClaimEvidence({ roleText: "Lead" }))).toBe("partial");
    expect(evidenceStatus(mapClaimEvidence({ situationText: "a", roleText: "b", measurementText: "c", resultText: "d" }))).toBe("ready");
  });

  it("asks how a number was measured before anything else", () => {
    const empty = mapClaimEvidence(null);
    expect(riskiestEmptyField(claim({ title: "Cut latency 40%" }), empty)).toBe("measurement");
    expect(riskiestEmptyField(claim({ metricText: "x3" }), empty)).toBe("measurement");
    expect(riskiestEmptyField(claim(), empty)).toBe("result");
    expect(riskiestEmptyField(claim(), mapClaimEvidence({ resultText: "Shipped" }))).toBe("situation");
    expect(riskiestEmptyField(claim(), mapClaimEvidence({ situationText: "a", roleText: "b", measurementText: "c", resultText: "d" }))).toBeNull();
  });

  it("uses the project's questions, falling back to the experience", () => {
    const items = [
      { anchorType: "experience", anchorRecordId: "e1" },
      { anchorType: "project", anchorRecordId: "p1" },
    ] as HeatmapItem[];
    expect(claimHeatmapItem(claim({ projectId: "p1", experienceId: "e1" }), items)).toBe(items[1]);
    expect(claimHeatmapItem(claim({ projectId: "p2", experienceId: "e1" }), items)).toBe(items[0]);
    expect(claimHeatmapItem(claim(), items)).toBeNull();
  });
});
