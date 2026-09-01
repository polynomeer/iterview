import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { SettingsPage } from "../../pages/settings/SettingsPage";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useUpdateSettingsMutation } from "../../features/profile/api/useUpdateSettingsMutation";
import { mockMatchMedia, renderWithProviders } from "../utils";

vi.mock("../../features/auth/api/useCurrentUserQuery", () => ({
  useCurrentUserQuery: vi.fn(),
}));

vi.mock("../../features/profile/api/useUpdateSettingsMutation", () => ({
  useUpdateSettingsMutation: vi.fn(),
}));

describe("SettingsPage", () => {
  it("renders the settings workspace with settings, appearance, and local review controls", () => {
    vi.mocked(useCurrentUserQuery).mockReturnValue({
      data: {
        id: "user-1",
        email: "learner@example.com",
        nickname: "Learner",
        jobRole: "Backend Engineer",
        yearsOfExperience: 5,
        settings: {
          targetScoreThreshold: 85,
          passScoreThreshold: 65,
          retryEnabled: true,
          dailyQuestionCount: 2,
          preferredLanguage: "en",
        },
        targetCompanies: ["Stripe", "Meta"],
        name: "Learner",
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useUpdateSettingsMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<SettingsPage />} path="/settings" />
      </Routes>,
      { route: "/settings", locale: "ko" },
    );

    expect(screen.getByText("연습 설정 작업공간")).toBeInTheDocument();
    expect(screen.getByText("평가 기본값 조정")).toBeInTheDocument();
    expect(screen.getByText("로컬 알림 타이밍과 방해 수준 조정")).toBeInTheDocument();
    expect(screen.getByText("다음 복습 사이클 전에 권장되는 조정")).toBeInTheDocument();
    expect(screen.getAllByText("라이트")).toHaveLength(2);
    expect(screen.getAllByText("로컬 전용").length).toBeGreaterThan(0);
  });

  it("saves preferred language through the settings workspace", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({
      preferredLanguage: "ko",
    });

    vi.mocked(useCurrentUserQuery).mockReturnValue({
      data: {
        id: "user-1",
        email: "learner@example.com",
        nickname: "Learner",
        jobRole: "Backend Engineer",
        yearsOfExperience: 5,
        settings: {
          targetScoreThreshold: 85,
          passScoreThreshold: 65,
          retryEnabled: true,
          dailyQuestionCount: 2,
          preferredLanguage: "en",
        },
        targetCompanies: ["Stripe"],
        name: "Learner",
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useUpdateSettingsMutation).mockReturnValue({
      mutateAsync,
      isPending: false,
      error: null,
    } as never);

    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route element={<SettingsPage />} path="/settings" />
      </Routes>,
      { route: "/settings", locale: "ko" },
    );

    await user.selectOptions(screen.getByLabelText("기본 언어"), "ko");
    await user.click(screen.getAllByRole("button", { name: "설정 저장" })[0]);

    expect(mutateAsync).toHaveBeenCalledWith({
      targetScoreThreshold: 85,
      passScoreThreshold: 65,
      retryEnabled: true,
      dailyQuestionCount: 2,
      preferredLanguage: "ko",
    });
  });

  it("renders the desktop layout when wide mode is active", () => {
    mockMatchMedia(true);

    vi.mocked(useCurrentUserQuery).mockReturnValue({
      data: {
        id: "user-1",
        email: "learner@example.com",
        nickname: "Learner",
        jobRole: "Backend Engineer",
        yearsOfExperience: 5,
        settings: {
          targetScoreThreshold: 85,
          passScoreThreshold: 65,
          retryEnabled: true,
          dailyQuestionCount: 2,
          preferredLanguage: "en",
        },
        targetCompanies: ["Stripe"],
        name: "Learner",
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useUpdateSettingsMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<SettingsPage />} path="/settings" />
      </Routes>,
      { route: "/settings", locale: "ko" },
    );

    expect(document.querySelector(".settings-browser__shell")).not.toBeNull();
  });

  it("renders a safe avatar fallback when the current-user identity fields are absent", () => {
    vi.mocked(useCurrentUserQuery).mockReturnValue({
      data: {
        id: "user-1",
        settings: {
          retryEnabled: true,
          preferredLanguage: "ko",
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useUpdateSettingsMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<SettingsPage />} path="/settings" />
      </Routes>,
      { route: "/settings", locale: "ko" },
    );

    expect(document.querySelector(".settings-browser__avatar")).toHaveTextContent("I");
  });
});
