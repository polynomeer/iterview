import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useLogout } from "../../features/auth/useLogout";
import { useUpdateSettingsMutation } from "../../features/profile/api/useUpdateSettingsMutation";
import { useAuth } from "../../shared/auth/useAuth";
import { Header } from "../../widgets/layout/Header";
import { renderWithProviders } from "../utils";

vi.mock("../../shared/auth/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../../features/auth/api/useCurrentUserQuery", () => ({ useCurrentUserQuery: vi.fn() }));
vi.mock("../../features/auth/useLogout", () => ({ useLogout: vi.fn() }));
vi.mock("../../features/profile/api/useUpdateSettingsMutation", () => ({ useUpdateSettingsMutation: vi.fn() }));

describe("Header", () => {
  it("labels every action and logs out from the icon button", async () => {
    const logout = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      accessToken: "token",
      isAuthenticated: true,
      setAccessToken: vi.fn(),
      clearSession: vi.fn(),
    });
    vi.mocked(useCurrentUserQuery).mockReturnValue({
      data: { email: "learner@example.com", name: "Learner" },
      isLoading: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useLogout).mockReturnValue(logout);
    vi.mocked(useUpdateSettingsMutation).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as never);

    renderWithProviders(<Header />, { route: "/questions/1", locale: "ko" });

    expect(screen.getByText("질문 상세")).toBeInTheDocument();
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAccessibleName();
    }
    expect(screen.getByRole("link", { name: "보관함" })).toHaveAttribute("href", "/library");
    expect(screen.queryByRole("button", { name: "알" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "활" })).not.toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole("button", { name: "로그아웃" }));

    expect(logout).toHaveBeenCalled();
  });
});
