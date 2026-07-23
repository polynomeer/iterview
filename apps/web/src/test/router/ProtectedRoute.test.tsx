import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "../../app/router/ProtectedRoute";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useLogout } from "../../features/auth/useLogout";
import { useAuth } from "../../shared/auth/useAuth";
import { LocationDisplay, renderWithProviders } from "../utils";

vi.mock("../../shared/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../features/auth/api/useCurrentUserQuery", () => ({
  useCurrentUserQuery: vi.fn(),
}));

vi.mock("../../features/auth/useLogout", () => ({
  useLogout: vi.fn(),
}));

describe("ProtectedRoute", () => {
  it("redirects unauthenticated users to login", () => {
    vi.mocked(useAuth).mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
      setAccessToken: vi.fn(),
      clearSession: vi.fn(),
    });
    vi.mocked(useCurrentUserQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: undefined,
    } as never);
    vi.mocked(useLogout).mockReturnValue(vi.fn());

    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<div>Private content</div>} path="/private" />
        </Route>
        <Route
          element={
            <>
              <div>Login page</div>
              <LocationDisplay />
            </>
          }
          path="/login"
        />
      </Routes>,
      { route: "/private?tab=score" },
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.getByTestId("location-display")).toHaveTextContent("/login");
  });

  it("renders protected content for authenticated users with a valid session", () => {
    vi.mocked(useAuth).mockReturnValue({
      accessToken: "token",
      isAuthenticated: true,
      setAccessToken: vi.fn(),
      clearSession: vi.fn(),
    });
    vi.mocked(useCurrentUserQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: { id: "user-1" },
    } as never);
    vi.mocked(useLogout).mockReturnValue(vi.fn());

    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<div>Private content</div>} path="/private" />
        </Route>
      </Routes>,
      { route: "/private" },
    );

    expect(screen.getByText("Private content")).toBeInTheDocument();
  });
});
