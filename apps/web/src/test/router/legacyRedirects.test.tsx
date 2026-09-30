import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LEGACY_REDIRECTS, legacyRedirectRoutes } from "../../app/router/legacyRedirects";

function CurrentLocation() {
  const { pathname, search, hash } = useLocation();
  return <output data-testid="location">{`${pathname}${search}${hash}`}</output>;
}

function landOn(path: string) {
  const router = createMemoryRouter([...legacyRedirectRoutes, { path: "*", element: <CurrentLocation /> }], {
    initialEntries: [path],
  });
  render(<RouterProvider router={router} />);
  return screen.getByTestId("location").textContent;
}

const EXPECTED: Array<[legacy: string, current: string]> = [
  ["/practice", "/questions"],
  ["/skills", "/questions/skills"],
  ["/answer-attempts/7/result", "/attempts/7"],
  ["/review-queue", "/review"],
  ["/archive", "/review/done"],
  ["/feed", "/explore"],
  ["/profile", "/settings/profile"],
  ["/profile/resumes", "/resume"],
  ["/profile/resumes/analysis", "/resume"],
  ["/resume/analysis", "/resume"],
  ["/resume-versions/3/editor", "/resume/3/claims"],
  ["/resume-versions/3/heatmap", "/resume/3/heatmap"],
  ["/resume-versions/3/heatmap/anchors/project/31", "/resume/3/heatmap/anchors/project/31"],
  ["/resume-tailor", "/resume/tailor"],
  ["/resume-tailor/job-postings", "/resume/tailor/job-postings"],
  ["/resume-tailor/resume-versions/3/analyses", "/resume/3/tailor"],
  ["/resume-tailor/resume-versions/3/analyses/9", "/resume/3/tailor/9"],
  ["/interviews", "/interview"],
  ["/interviews/4", "/interview/sessions/4"],
  ["/interviews/4/result", "/interview/sessions/4/result"],
  ["/practical-interviews", "/interview/records"],
  ["/practical-interviews/upload", "/interview/records/upload"],
  ["/practical-interviews/2", "/interview/records/2"],
  ["/practical-interviews/2/transcript", "/interview/records/2/transcript"],
  ["/practical-interviews/2/questions/5", "/interview/records/2/questions/5"],
  ["/practical-interviews/2/simulate", "/interview/records/2/simulate"],
];

describe("legacy redirects", () => {
  it("covers every legacy route with an expectation", () => {
    expect(LEGACY_REDIRECTS).toHaveLength(EXPECTED.length);
  });

  it.each(EXPECTED)("redirects %s to %s", (legacy, current) => {
    expect(landOn(legacy)).toBe(current);
  });

  it("keeps query strings and hashes", () => {
    expect(landOn("/resume-versions/3/heatmap?selectedAnchor=project%3A31&weakOnly=true#detail")).toBe(
      "/resume/3/heatmap?selectedAnchor=project%3A31&weakOnly=true#detail",
    );
  });
});
