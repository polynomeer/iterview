import { describe, expect, it } from "vitest";
import { resolveHeaderTitleKey } from "../../widgets/layout/headerTitles";

describe("resolveHeaderTitleKey", () => {
  it.each([
    ["/", "nav.today"],
    ["/questions/1", "header.questionDetail"],
    ["/questions/1/tree", "header.questionTree"],
    ["/questions/1/answer", "header.answerEditor"],
    ["/attempts/7", "header.resultAnalysis"],
    ["/review", "nav.reviewToday"],
    ["/resume", "nav.resume"],
    ["/resume/3", "nav.resume"],
    ["/resume/3/versions", "nav.resumeVersions"],
    ["/resume/1/heatmap/anchors/project/3", "header.resumeHeatmap"],
    ["/resume/tailor/job-postings", "nav.resumeTailor"],
    ["/interview/sessions/1/result", "header.interviewSessionResult"],
    ["/interview/sessions/1", "header.interviewSession"],
    ["/interview/records/2/transcript", "nav.practicalInterview"],
    ["/settings", "nav.settings"],
    ["/questions/skills", "nav.skillMap"],
  ])("maps %s to %s", (pathname, key) => {
    expect(resolveHeaderTitleKey(pathname)).toBe(key);
  });

  it("titles unknown paths as not found", () => {
    expect(resolveHeaderTitleKey("/does-not-exist")).toBe("common.pageNotFoundTitle");
  });
});
