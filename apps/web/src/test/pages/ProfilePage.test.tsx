import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProfilePage } from "../../pages/profile/ProfilePage";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useUpdateProfileMutation } from "../../features/profile/api/useUpdateProfileMutation";
import { mockMatchMedia, renderWithProviders } from "../utils";

vi.mock("../../features/auth/api/useCurrentUserQuery", () => ({
  useCurrentUserQuery: vi.fn(),
}));

vi.mock("../../features/profile/api/useUpdateProfileMutation", () => ({
  useUpdateProfileMutation: vi.fn(),
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

    renderWithProviders(
      <Routes>
        <Route element={<ProfilePage />} path="/profile" />
      </Routes>,
      { route: "/profile" },
    );

    expect(screen.getByText("Learner")).toBeInTheDocument();
    expect(screen.getByText("Edit your interview profile")).toBeInTheDocument();
    expect(screen.getByText("Open settings")).toBeInTheDocument();
    expect(document.querySelector(".profile-layout--desktop")).not.toBeNull();
  });

  it("renders links to separated operations workspaces", () => {
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

    renderWithProviders(
      <Routes>
        <Route element={<ProfilePage />} path="/profile" />
      </Routes>,
      { route: "/profile" },
    );

    expect(screen.getByRole("link", { name: "Open settings" })).toHaveAttribute("href", "/settings");
    expect(screen.getByRole("link", { name: "Open target companies" })).toHaveAttribute("href", "/target-companies");
  });
});
