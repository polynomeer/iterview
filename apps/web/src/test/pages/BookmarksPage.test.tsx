import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { BookmarksPage } from "../../pages/bookmarks/BookmarksPage";
import { mockMatchMedia, renderWithProviders } from "../utils";

describe("BookmarksPage", () => {
  it("renders the bookmarks workspace with filter and detail rail", () => {
    renderWithProviders(
      <Routes>
        <Route element={<BookmarksPage />} path="/bookmarks" />
      </Routes>,
      { route: "/bookmarks" },
    );

    expect(screen.getByText("Saved interview bookmarks")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search bookmarks" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Saved Questions" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Explain why Redis lock renewal/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Practice question" })).toHaveAttribute(
      "href",
      "/questions/distributed-lock/tree",
    );
  });

  it("renders the desktop bookmarks layout when wide mode is active", () => {
    mockMatchMedia(true);

    renderWithProviders(
      <Routes>
        <Route element={<BookmarksPage />} path="/bookmarks" />
      </Routes>,
      { route: "/bookmarks" },
    );

    expect(document.querySelector(".bookmarks-layout--desktop")).not.toBeNull();
  });
});
