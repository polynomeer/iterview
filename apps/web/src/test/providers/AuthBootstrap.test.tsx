import { act, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { AuthBootstrap } from "../../app/providers/AuthBootstrap";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useLogout } from "../../features/auth/useLogout";
import { useAuth } from "../../shared/auth/useAuth";
import { renderWithProviders } from "../utils";

vi.mock("../../shared/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../features/auth/api/useCurrentUserQuery", () => ({
  useCurrentUserQuery: vi.fn(),
}));

vi.mock("../../features/auth/useLogout", () => ({
  useLogout: vi.fn(),
}));

describe("AuthBootstrap", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the recovery screen after bounded session restore retries", async () => {
    const refetch = vi.fn().mockResolvedValue({ status: "error" });

    vi.mocked(useAuth).mockReturnValue({
      accessToken: "token",
      isAuthenticated: true,
      setAccessToken: vi.fn(),
      clearSession: vi.fn(),
    });
    vi.mocked(useLogout).mockReturnValue(vi.fn());

    const queryState = {
      isLoading: false,
      isError: true,
      isSuccess: false,
      error: new Error("Something went wrong on the server."),
      data: undefined,
      refetch,
    };

    vi.mocked(useCurrentUserQuery).mockImplementation(() => queryState as never);

    renderWithProviders(
      <AuthBootstrap>
        <div>App content</div>
      </AuthBootstrap>,
    );

    expect(screen.getByText("Loading your account")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_300);
    });

    expect(screen.getByText("Reconnecting your account")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_600);
      await vi.advanceTimersByTimeAsync(2_600);
      await vi.advanceTimersByTimeAsync(2_600);
    });

    expect(screen.getByText("Session restore paused")).toBeInTheDocument();
    expect(screen.getByText("Retry now")).toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });
});
