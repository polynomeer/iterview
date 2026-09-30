import { matchRoutes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { appRoutes } from "../../app/router";
import { routeConfig } from "../../shared/config/routes";

function deepestPath(pathname: string) {
  const matches = matchRoutes(appRoutes, pathname) ?? [];
  return matches[matches.length - 1]?.route.path;
}

describe("app routes", () => {
  it.each([
    ["/questions", routeConfig.practice.path],
    ["/questions/skills", routeConfig.skills.path],
    ["/questions/12", routeConfig.questionDetail.path],
    ["/questions/12/answer", routeConfig.answerEditor.path],
    ["/attempts/7", routeConfig.resultAnalysis.path],
    ["/review", routeConfig.reviewQueue.path],
    ["/review/done", routeConfig.archive.path],
    ["/resume", routeConfig.resume.path],
    ["/resume/analysis", routeConfig.resumeAnalysis.path],
    ["/resume/tailor", routeConfig.resumeTailor.path],
    ["/resume/tailor/job-postings", routeConfig.resumeTailorJobPostings.path],
    ["/resume/3/claims", routeConfig.resumeEditor.path],
    ["/resume/3/tailor/9", routeConfig.resumeTailorAnalysisDetail.path],
    ["/interview", routeConfig.interview.path],
    ["/interview/sessions/4/result", routeConfig.interviewSessionResult.path],
    ["/interview/records/upload", routeConfig.practicalInterviewUpload.path],
    ["/interview/records/2", routeConfig.practicalInterviewDetail.path],
    ["/settings/profile", routeConfig.profile.path],
    ["/explore", routeConfig.feed.path],
  ])("resolves %s to its own screen", (pathname, expected) => {
    expect(deepestPath(pathname)).toBe(expected);
  });

  it("sends unknown paths to the not-found route", () => {
    expect(deepestPath("/nope/deeper")).toBe("*");
  });
});
