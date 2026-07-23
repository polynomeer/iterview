import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProfilePage } from "../../pages/profile/ProfilePage";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useUpdateProfileMutation } from "../../features/profile/api/useUpdateProfileMutation";
import { useUpdateSettingsMutation } from "../../features/profile/api/useUpdateSettingsMutation";
import { useUpdateTargetCompaniesMutation } from "../../features/profile/api/useUpdateTargetCompaniesMutation";
import { mockMatchMedia, renderWithProviders } from "../utils";

vi.mock("../../features/auth/api/useCurrentUserQuery", () => ({
  useCurrentUserQuery: vi.fn(),
}));

vi.mock("../../features/profile/api/useUpdateProfileMutation", () => ({
  useUpdateProfileMutation: vi.fn(),
}));

vi.mock("../../features/profile/api/useUpdateSettingsMutation", () => ({
  useUpdateSettingsMutation: vi.fn(),
}));

vi.mock("../../features/profile/api/useUpdateTargetCompaniesMutation", () => ({
  useUpdateTargetCompaniesMutation: vi.fn(),
}));

describe("ProfilePage", () => {
  it("renders grouped desktop management sections", () => {
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
        },
        targetCompanies: ["Stripe", "Meta"],
        name: "Learner",
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useUpdateProfileMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);
    vi.mocked(useUpdateSettingsMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);
    vi.mocked(useUpdateTargetCompaniesMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<ProfilePage />} path="/profile" />
      </Routes>,
      { route: "/profile" },
    );

    expect(screen.getByText("Learner")).toBeInTheDocument();
    expect(screen.getByText("Edit your interview profile")).toBeInTheDocument();
    expect(screen.getByText("Adjust evaluation defaults")).toBeInTheDocument();
    expect(document.querySelector(".profile-layout--desktop")).not.toBeNull();
  });

  it("updates and persists the selected theme locally", async () => {
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
        },
        targetCompanies: ["Stripe"],
        name: "Learner",
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useUpdateProfileMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);
    vi.mocked(useUpdateSettingsMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);
    vi.mocked(useUpdateTargetCompaniesMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);

    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route element={<ProfilePage />} path="/profile" />
      </Routes>,
      { route: "/profile" },
    );

    await user.click(screen.getByRole("radio", { name: /dracula/i }));

    expect(document.documentElement.dataset.theme).toBe("dracula");
    expect(window.localStorage.getItem("iterview-theme")).toBe("dracula");
  });

  it("saves preferred language through settings", async () => {
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
    vi.mocked(useUpdateProfileMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);
    vi.mocked(useUpdateSettingsMutation).mockReturnValue({
      mutateAsync,
      isPending: false,
      error: null,
    } as never);
    vi.mocked(useUpdateTargetCompaniesMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);

    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route element={<ProfilePage />} path="/profile" />
      </Routes>,
      { route: "/profile" },
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
});
