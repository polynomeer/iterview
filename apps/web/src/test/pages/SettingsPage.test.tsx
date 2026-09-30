import userEvent from "@testing-library/user-event";
import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useUpdateProfileMutation } from "../../features/profile/api/useUpdateProfileMutation";
import { useUpdateSettingsMutation } from "../../features/profile/api/useUpdateSettingsMutation";
import { useUpdateTargetCompaniesMutation } from "../../features/profile/api/useUpdateTargetCompaniesMutation";
import { useUploadProfileImageMutation } from "../../features/profile/api/useUploadProfileImageMutation";
import { SettingsPage } from "../../pages/settings/SettingsPage";
import { renderWithProviders } from "../utils";

vi.mock("../../features/auth/api/useCurrentUserQuery", () => ({ useCurrentUserQuery: vi.fn() }));
vi.mock("../../features/auth/useLogout", () => ({ useLogout: () => vi.fn() }));
vi.mock("../../features/profile/api/useUpdateProfileMutation", () => ({ useUpdateProfileMutation: vi.fn() }));
vi.mock("../../features/profile/api/useUpdateSettingsMutation", () => ({ useUpdateSettingsMutation: vi.fn() }));
vi.mock("../../features/profile/api/useUpdateTargetCompaniesMutation", () => ({ useUpdateTargetCompaniesMutation: vi.fn() }));
vi.mock("../../features/profile/api/useUploadProfileImageMutation", () => ({ useUploadProfileImageMutation: vi.fn() }));

const updateProfile = vi.fn();
const updateSettings = vi.fn();
const updateSettingsSync = vi.fn();
const updateTargets = vi.fn();

beforeEach(() => {
  updateProfile.mockReset().mockResolvedValue({});
  updateSettings.mockReset().mockResolvedValue({});
  updateSettingsSync.mockReset();
  updateTargets.mockReset();
  vi.mocked(useCurrentUserQuery).mockReturnValue({
    data: {
      id: "user-1",
      email: "learner@example.com",
      nickname: "Learner",
      jobRole: "Backend Engineer",
      yearsOfExperience: 5,
      settings: { targetScoreThreshold: 85, passScoreThreshold: 65, retryEnabled: true, dailyQuestionCount: 2, preferredLanguage: "ko" },
      targetCompanies: ["Stripe", "Meta"],
      name: "Learner",
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as never);
  vi.mocked(useUpdateProfileMutation).mockReturnValue({ mutateAsync: updateProfile, isPending: false, error: null } as never);
  vi.mocked(useUpdateSettingsMutation).mockReturnValue({ mutateAsync: updateSettings, mutate: updateSettingsSync, isPending: false, error: null } as never);
  vi.mocked(useUpdateTargetCompaniesMutation).mockReturnValue({ mutate: updateTargets, isPending: false, error: null } as never);
  vi.mocked(useUploadProfileImageMutation).mockReturnValue({ mutate: vi.fn(), isPending: false, error: null } as never);
});

describe("SettingsPage", () => {
  it("puts profile, target companies, practice, display, and account on one page", () => {
    renderWithProviders(<SettingsPage />, { route: "/settings", locale: "ko" });

    expect(screen.getByRole("heading", { level: 1, name: "설정" })).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "설정 항목" });
    expect(within(nav).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual(["#profile", "#target-companies", "#practice", "#display", "#account"]);
    expect(screen.getByLabelText("이름")).toHaveValue("Learner");
    expect(screen.getByLabelText("경력 연차")).toHaveValue("5");
    expect(screen.getByText("Stripe")).toBeInTheDocument();
    expect(screen.getByText("learner@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그아웃" })).toBeInTheDocument();
  });

  it("saves the profile and practice goals", async () => {
    renderWithProviders(<SettingsPage />, { route: "/settings", locale: "ko" });

    const profile = screen.getByRole("region", { name: "프로필" });
    await userEvent.clear(within(profile).getByLabelText("직무"));
    await userEvent.type(within(profile).getByLabelText("직무"), "Platform");
    await userEvent.click(within(profile).getByRole("button", { name: "저장" }));
    expect(updateProfile).toHaveBeenCalledWith({ nickname: "Learner", jobRole: "Platform", yearsOfExperience: 5 });
    expect(await within(profile).findByText("저장했어요.")).toBeInTheDocument();

    const practice = screen.getByRole("region", { name: "연습" });
    await userEvent.clear(within(practice).getByLabelText("하루 질문 수"));
    await userEvent.type(within(practice).getByLabelText("하루 질문 수"), "5");
    await userEvent.click(within(practice).getByRole("checkbox"));
    await userEvent.click(within(practice).getByRole("button", { name: "저장" }));
    expect(updateSettings).toHaveBeenCalledWith({ dailyQuestionCount: 5, targetScoreThreshold: 85, passScoreThreshold: 65, retryEnabled: false });
  });

  it("adds and removes target companies with the real list", async () => {
    renderWithProviders(<SettingsPage />, { route: "/settings", locale: "ko" });

    await userEvent.type(screen.getByLabelText("회사 이름"), "Toss");
    await userEvent.click(screen.getByRole("button", { name: "추가" }));
    expect(updateTargets).toHaveBeenCalledWith({ targetCompanies: ["Stripe", "Meta", "Toss"] });

    await userEvent.click(screen.getByRole("button", { name: "Meta 삭제" }));
    expect(updateTargets).toHaveBeenLastCalledWith({ targetCompanies: ["Stripe"] });
  });

  it("switches the language right away and saves it as the preference", async () => {
    renderWithProviders(<SettingsPage />, { route: "/settings", locale: "ko" });

    await userEvent.click(screen.getByRole("radio", { name: "English" }));
    expect(updateSettingsSync).toHaveBeenCalledWith({ preferredLanguage: "en" });
    expect(screen.getByRole("heading", { level: 1, name: "Settings" })).toBeInTheDocument();
  });
});
