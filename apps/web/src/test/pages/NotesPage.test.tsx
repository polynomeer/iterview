import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { NotesPage } from "../../pages/notes/NotesPage";
import { mockMatchMedia, renderWithProviders } from "../utils";

describe("NotesPage", () => {
  it("renders the notes workspace with editor and connected context", () => {
    renderWithProviders(
      <Routes>
        <Route element={<NotesPage />} path="/notes" />
      </Routes>,
      { route: "/notes" },
    );

    expect(screen.getByText("Keep the explanation you want ready before the next DFS drill-down")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Distributed Lock Patterns" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search notes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getAllByText("Linked questions").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Open resume" })).toHaveAttribute(
      "href",
      "/profile/resumes/analysis",
    );
  });

  it("renders the desktop notes layout when wide mode is active", () => {
    mockMatchMedia(true);

    renderWithProviders(
      <Routes>
        <Route element={<NotesPage />} path="/notes" />
      </Routes>,
      { route: "/notes" },
    );

    expect(document.querySelector(".notes-layout--desktop")).not.toBeNull();
  });
});
