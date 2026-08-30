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
      { route: "/notes", locale: "ko" },
    );

    expect(screen.getByText("다음 DFS 드릴다운 전에 원하는 설명을 준비해 두세요")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "분산 락 패턴" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "노트 검색" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "편집" })).toBeInTheDocument();
    expect(screen.getAllByText("연결 질문").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "이력서 열기" })).toHaveAttribute(
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
      { route: "/notes", locale: "ko" },
    );

    expect(document.querySelector(".notes-layout--desktop")).not.toBeNull();
  });
});
