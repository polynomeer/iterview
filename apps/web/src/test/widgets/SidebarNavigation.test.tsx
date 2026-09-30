import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { LocationDisplay } from "../utils";
import { describe, expect, it, vi } from "vitest";
import { useActivateResumeVersionMutation } from "../../features/resume/api/useActivateResumeVersionMutation";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { useAuth } from "../../shared/auth/useAuth";
import { followVersion, SidebarNavigation } from "../../widgets/layout/SidebarNavigation";
import { renderWithProviders } from "../utils";

vi.mock("../../shared/auth/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../../features/resume/api/useResumeListQuery", () => ({ useResumeListQuery: vi.fn() }));
vi.mock("../../features/resume/api/useActivateResumeVersionMutation", () => ({ useActivateResumeVersionMutation: vi.fn() }));
vi.mock("../../features/review-queue/api/useReviewQueueQuery", () => ({ useReviewQueueQuery: vi.fn() }));

const activate = vi.fn().mockResolvedValue(undefined);

function signIn(isAuthenticated: boolean) {
  vi.mocked(useAuth).mockReturnValue({
    accessToken: isAuthenticated ? "token" : null,
    isAuthenticated,
    setAccessToken: vi.fn(),
    clearSession: vi.fn(),
  });
  vi.mocked(useReviewQueueQuery).mockReturnValue({ data: { items: [{}, {}, {}, {}] } } as never);
  vi.mocked(useResumeListQuery).mockReturnValue({
    isLoading: false,
    data: {
      items: [
        {
          id: "1",
          title: "백엔드 이력서",
          versions: [
            { id: "2", versionNumberLabel: "v2", isActive: false, parsingStatus: "completed", fileNameLabel: "v2.pdf", uploadedAtLabel: "9월 1일" },
            { id: "3", versionNumberLabel: "v3", isActive: true, parsingStatus: "completed", fileNameLabel: "v3.pdf", uploadedAtLabel: "9월 20일" },
          ],
        },
      ],
    },
  } as never);
  vi.mocked(useActivateResumeVersionMutation).mockReturnValue({ mutateAsync: activate, error: null } as never);
}

describe("SidebarNavigation", () => {
  it("shows the five primary areas with the review count and marks the current area", () => {
    signIn(true);
    renderWithProviders(<SidebarNavigation />, { route: "/attempts/7", locale: "ko" });

    const primary = screen.getByRole("navigation", { name: "주 메뉴" });
    const labels = within(primary)
      .getAllByRole("link")
      .map((link) => link.textContent);
    expect(labels).toEqual(["오늘", "질문", "복습4", "이력서", "면접"]);
    // An evaluation result belongs to the 질문 area.
    expect(within(primary).getByRole("link", { name: "질문" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByLabelText("복습 4개 대기")).toBeInTheDocument();
  });

  it("shows the active resume version and settings at the bottom", () => {
    signIn(true);
    renderWithProviders(<SidebarNavigation />, { route: "/settings/profile", locale: "ko" });

    expect(screen.getByRole("button", { name: /백엔드 이력서.*v3 · 분석 완료/ })).toHaveAttribute("aria-haspopup", "dialog");
    expect(screen.getByRole("link", { name: "설정" })).toHaveAttribute("aria-current", "page");
  });

  it("offers guests the public areas, explore, and sign-in", () => {
    signIn(false);
    renderWithProviders(<SidebarNavigation />, { route: "/explore", locale: "ko" });

    const labels = screen.getAllByRole("link").map((link) => link.textContent);
    expect(labels).toEqual(["iiterview", "오늘", "질문", "둘러보기", "로그인", "회원가입"]);
    expect(screen.getByRole("link", { name: "둘러보기" })).toHaveAttribute("aria-current", "page");
    expect(useReviewQueueQuery).toHaveBeenCalledWith({ enabled: false });
  });

  it("switches the active version from a dialog and follows it on version-scoped pages", async () => {
    signIn(true);
    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route
          element={
            <>
              <SidebarNavigation />
              <LocationDisplay />
            </>
          }
          path="*"
        />
      </Routes>,
      { route: "/resume/3/heatmap", locale: "ko" },
    );

    await user.click(screen.getByRole("button", { name: /백엔드 이력서/ }));
    const dialog = screen.getByRole("dialog", { name: "활성 이력서 버전" });
    expect(within(dialog).getByRole("button", { name: /v3/ })).toHaveAttribute("aria-current", "true");

    await user.click(within(dialog).getByRole("button", { name: /v2/ }));

    expect(activate).toHaveBeenCalledWith("2");
    await waitFor(() => expect(screen.getByTestId("location-display")).toHaveTextContent("/resume/2/heatmap"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("followVersion", () => {
  it("maps version-scoped tabs and ignores other routes", () => {
    expect(followVersion("/resume/3/claims", "7")).toBe("/resume/7/claims");
    expect(followVersion("/resume/3/heatmap/anchors/project/1", "7")).toBe("/resume/7/heatmap");
    expect(followVersion("/resume/3/tailor/9", "7")).toBe("/resume/7/tailor");
    expect(followVersion("/resume/3", "7")).toBe("/resume/7");
    expect(followVersion("/resume/3/versions", "7")).toBe("/resume/7/versions");
    expect(followVersion("/resume/analysis", "7")).toBeNull();
    expect(followVersion("/resume/tailor/job-postings", "7")).toBeNull();
    expect(followVersion("/questions", "7")).toBeNull();
  });
});
