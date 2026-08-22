import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useNavigate } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useLoginMutation } from "../../features/auth/api/useLoginMutation";
import { useLogout } from "../../features/auth/useLogout";
import { LoginPage } from "../../pages/login/LoginPage";
import { useAuth } from "../../shared/auth/useAuth";
import { renderWithProviders } from "../utils";

const navigateMock = vi.fn();
const mutateAsyncMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock("../../shared/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../features/auth/api/useCurrentUserQuery", () => ({
  useCurrentUserQuery: vi.fn(),
}));

vi.mock("../../features/auth/api/useLoginMutation", () => ({
  useLoginMutation: vi.fn(),
}));

vi.mock("../../features/auth/useLogout", () => ({
  useLogout: vi.fn(),
}));

describe("LoginPage", () => {
  it("submits the login form through the public login mutation", async () => {
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    vi.mocked(useAuth).mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
      setAccessToken: vi.fn(),
      clearSession: vi.fn(),
    });
    vi.mocked(useCurrentUserQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useLogout).mockReturnValue(vi.fn());
    mutateAsyncMock.mockResolvedValue({});
    vi.mocked(useLoginMutation).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
      error: null,
    } as never);

    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route element={<LoginPage />} path="/login" />
      </Routes>,
      { route: "/login" },
    );

    await user.clear(screen.getByRole("textbox", { name: "Email" }));
    await user.type(screen.getByRole("textbox", { name: "Email" }), "learner@example.com");
    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      email: "learner@example.com",
      password: "password123",
    });
  });
});
