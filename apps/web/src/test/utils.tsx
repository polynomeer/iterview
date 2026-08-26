import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { vi } from "vitest";
import { LocaleProvider } from "../shared/i18n";
import { ThemeProvider } from "../shared/theme";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

type RenderWithProvidersOptions = {
  route?: string;
};

export function renderWithProviders(
  ui: ReactElement,
  { route = "/" }: RenderWithProvidersOptions = {},
) {
  const queryClient = createTestQueryClient();

  window.localStorage.setItem("iterview-locale", "en");

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <ThemeProvider>
        <LocaleProvider>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
          </QueryClientProvider>
        </LocaleProvider>
      </ThemeProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper }),
  };
}

export function LocationDisplay() {
  const location = useLocation();

  return <div data-testid="location-display">{`${location.pathname}${location.search}`}</div>;
}

export function mockMatchMedia(matches: boolean) {
  const mediaQueryList = {
    matches,
    media: "(min-width: 1024px)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mediaQueryList));

  return mediaQueryList;
}
