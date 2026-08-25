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
      { route: "/settings" },
    );

    expect(screen.getByText("Practice settings workspace")).toBeInTheDocument();
    expect(screen.getByText("Adjust evaluation defaults")).toBeInTheDocument();
    expect(screen.getByText("Tune local reminder timing and interruption level")).toBeInTheDocument();
    expect(screen.getByText("Recommended tweaks before the next review cycle")).toBeInTheDocument();
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
      { route: "/settings" },
    );

    await user.selectOptions(screen.getByLabelText("Preferred language"), "ko");
    await user.click(screen.getByRole("button", { name: "Save settings" }));

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
      { route: "/settings" },
    );

    expect(document.querySelector(".settings-layout--desktop")).not.toBeNull();
  });
});
