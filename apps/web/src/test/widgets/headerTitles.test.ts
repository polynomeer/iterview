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
    ["/scheduled-reviews", "sidebar.scheduledReviews"],
    ["/resume", "nav.resumeVersions"],
    ["/resume/analysis", "nav.resumeAnalysis"],
    ["/resume/1/heatmap/anchors/project/3", "header.resumeHeatmap"],
    ["/resume/tailor/job-postings", "nav.resumeTailor"],
    ["/interview/sessions/1/result", "header.interviewSessionResult"],
    ["/interview/sessions/1", "header.interviewSession"],
    ["/interview/records/2/transcript", "nav.practicalInterview"],
    ["/settings", "nav.preferences"],
  ])("maps %s to %s", (pathname, key) => {
    expect(resolveHeaderTitleKey(pathname)).toBe(key);
  });

  it("falls back to the default title for unknown paths", () => {
    expect(resolveHeaderTitleKey("/does-not-exist")).toBe("header.defaultTitle");
  });
});
