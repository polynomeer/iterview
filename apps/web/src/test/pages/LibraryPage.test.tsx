import userEvent from "@testing-library/user-event";
import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLibraryQuery } from "../../features/library/api/useLibraryQuery";
import { LibraryPage } from "../../pages/library/LibraryPage";
import { renderWithProviders } from "../utils";

vi.mock("../../features/library/api/useLibraryQuery", () => ({ useLibraryQuery: vi.fn() }));

const cache = { questionId: 3, title: "What are cache-aside tradeoffs?", categoryName: "System Design", difficultyLevel: "MEDIUM" };
const queue = { questionId: 4, title: "How do you keep consumers idempotent?", categoryName: "System Design", difficultyLevel: "HARD" };

function mockLibrary(data: unknown) {
  vi.mocked(useLibraryQuery).mockReturnValue({ data, isLoading: false, isError: false, error: null, refetch: vi.fn() } as never);
}

describe("LibraryPage", () => {
  beforeEach(() => {
    mockLibrary({
      bookmarks: [{ question: cache, bookmarkedAt: "2026-09-30T10:00:00Z", hasNote: false }],
      notes: [{ question: queue, body: "Key per message.\nDedupe table.", updatedAt: "2026-10-01T09:00:00Z", bookmarked: false }],
      materials: [
        { materialId: 9, title: "Idempotency Keys", materialType: "article", sourceName: "Iterview Editorial", contentUrl: "https://example.com/read", estimatedMinutes: 8, question: cache },
      ],
    });
  });

  it("lists saved questions, notes, and linked reading in tabs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LibraryPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Library" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Saved questions/, selected: true })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: cache.title })).toHaveAttribute("href", "/questions/3");

    await user.click(screen.getByRole("tab", { name: /Notes/ }));
    expect(screen.getByRole("link", { name: queue.title })).toHaveAttribute("href", "/questions/4");
    expect(screen.getByText(/Key per message\./)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Reading/ }));
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByText("Idempotency Keys")).toBeInTheDocument();
    expect(within(panel).getByText("8 min")).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: `For: ${cache.title}` })).toHaveAttribute("href", "/questions/3");
    expect(within(panel).getByRole("link", { name: "Open" })).toHaveAttribute("href", "https://example.com/read");
  });

  it("explains how to fill an empty library", () => {
    mockLibrary({ bookmarks: [], notes: [], materials: [] });
    renderWithProviders(<LibraryPage />);

    expect(screen.getByRole("heading", { name: "Nothing saved yet" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse questions" })).toHaveAttribute("href", "/questions");
  });
});
