import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useLatestResumeQuery } from "../../features/resume/api/useLatestResumeQuery";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { useAuth } from "../../shared/auth/useAuth";
import { SidebarNavigation } from "../../widgets/layout/SidebarNavigation";
import { renderWithProviders } from "../utils";

vi.mock("../../shared/auth/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../../features/resume/api/useLatestResumeQuery", () => ({ useLatestResumeQuery: vi.fn() }));
vi.mock("../../features/review-queue/api/useReviewQueueQuery", () => ({ useReviewQueueQuery: vi.fn() }));

function signIn(isAuthenticated: boolean) {
  vi.mocked(useAuth).mockReturnValue({
    accessToken: isAuthenticated ? "token" : null,
    isAuthenticated,
    setAccessToken: vi.fn(),
    clearSession: vi.fn(),
  });
  vi.mocked(useReviewQueueQuery).mockReturnValue({ data: { items: [{}, {}, {}, {}] } } as never);
  vi.mocked(useLatestResumeQuery).mockReturnValue({
    isLoading: false,
    data: {
      items: [
        {
          id: "1",
          title: "백엔드 이력서",
          versions: [
            { id: "2", versionNumberLabel: "v2", isActive: false, parsingStatusLabel: "완료" },
            { id: "3", versionNumberLabel: "v3", isActive: true, parsingStatusLabel: "완료" },
          ],
        },
      ],
    },
  } as never);
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

    expect(screen.getByRole("link", { name: /백엔드 이력서.*v3 · 완료/ })).toHaveAttribute("href", "/resume");
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
});
