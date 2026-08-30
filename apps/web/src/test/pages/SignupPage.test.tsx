import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useNavigate } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { SignupPage } from "../../pages/signup/SignupPage";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useSignupMutation } from "../../features/auth/api/useSignupMutation";
import { useAuth } from "../../shared/auth/useAuth";
import { useLogout } from "../../features/auth/useLogout";
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

vi.mock("../../features/auth/api/useSignupMutation", () => ({
  useSignupMutation: vi.fn(),
}));

vi.mock("../../features/auth/useLogout", () => ({
  useLogout: vi.fn(),
}));

describe("SignupPage", () => {
  it("submits the signup form through the public signup mutation", async () => {
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
    vi.mocked(useSignupMutation).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
      error: null,
    } as never);

    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route element={<SignupPage />} path="/signup" />
      </Routes>,
      { route: "/signup", locale: "ko" },
    );

    expect(screen.getByText("시작 규칙")).toBeInTheDocument();
    expect(screen.getByText("열리는 작업")).toBeInTheDocument();
    expect(screen.getByText("빠른 경로")).toBeInTheDocument();
    await user.clear(screen.getByRole("textbox", { name: "이메일" }));
    await user.type(screen.getByRole("textbox", { name: "이메일" }), "new@example.com");
    await user.clear(screen.getByLabelText("비밀번호"));
    await user.type(screen.getByLabelText("비밀번호"), "secret123");
    await user.click(screen.getByRole("button", { name: "회원가입" }));

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "secret123",
    });
  });
});
