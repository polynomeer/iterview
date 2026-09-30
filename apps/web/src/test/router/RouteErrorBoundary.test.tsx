import { render, screen } from "@testing-library/react";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RouteErrorBoundary } from "../../app/router/RouteErrorBoundary";
import { NotFoundPage } from "../../pages/not-found/NotFoundPage";
import { LocaleProvider } from "../../shared/i18n";
import { ThemeProvider } from "../../shared/theme";

function CrashingPage(): never {
  throw new Error("boom");
}

function renderRoutes(initialPath: string) {
  window.localStorage.setItem("iterview-locale", "ko");
  const router = createMemoryRouter(
    [
      {
        element: (
          <div>
            <nav>shell navigation</nav>
            <Outlet />
          </div>
        ),
        children: [
          {
            errorElement: <RouteErrorBoundary />,
            children: [
              { path: "/", element: <p>today</p> },
              { path: "/crash", element: <CrashingPage /> },
              { path: "*", element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );

  return render(
    <ThemeProvider>
      <LocaleProvider>
        <RouterProvider router={router} />
      </LocaleProvider>
    </ThemeProvider>,
  );
}

describe("RouteErrorBoundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a recoverable error inside the shell instead of the router developer screen", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    renderRoutes("/crash");

    expect(screen.getByText("shell navigation")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("화면을 표시하는 중 문제가 생겼어요");
    expect(screen.getByRole("button", { name: "새로고침" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "오늘로 이동" })).toHaveAttribute("href", "/");
    expect(screen.queryByText(/Hey developer/)).not.toBeInTheDocument();
  });

  it("renders a not-found page for unknown paths", () => {
    renderRoutes("/does-not-exist");

    expect(screen.getByText("shell navigation")).toBeInTheDocument();
    expect(screen.getByText("페이지를 찾을 수 없어요")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "오늘로 이동" })).toHaveAttribute("href", "/");
  });
});
