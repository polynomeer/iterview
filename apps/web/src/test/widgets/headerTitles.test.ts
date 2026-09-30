import { describe, expect, it } from "vitest";
import { resolveHeaderTitleKey } from "../../widgets/layout/headerTitles";

describe("resolveHeaderTitleKey", () => {
  it.each([
    ["/", "sidebar.today"],
    ["/questions/1", "header.questionDetail"],
    ["/questions/1/tree", "header.questionTree"],
    ["/questions/1/answer", "header.answerEditor"],
    ["/answer-attempts/7/result", "header.resultAnalysis"],
    ["/review-queue", "navigation.reviewQueue"],
    ["/scheduled-reviews", "sidebar.scheduledReviews"],
    ["/profile/resumes", "navigation.resume"],
    ["/profile/resumes/analysis", "navigation.resumeAnalysis"],
    ["/resume-versions/1/heatmap/anchors/project/3", "header.resumeHeatmap"],
    ["/resume-tailor/job-postings", "navigation.resumeTailor"],
    ["/interviews/1/result", "header.interviewSessionResult"],
    ["/interview/sessions/1", "header.interviewSession"],
    ["/practical-interviews/2/transcript", "navigation.practicalInterviews"],
    ["/settings", "header.settings"],
  ])("maps %s to %s", (pathname, key) => {
    expect(resolveHeaderTitleKey(pathname)).toBe(key);
  });

  it("falls back to the default title for unknown paths", () => {
    expect(resolveHeaderTitleKey("/does-not-exist")).toBe("header.defaultTitle");
  });
});
