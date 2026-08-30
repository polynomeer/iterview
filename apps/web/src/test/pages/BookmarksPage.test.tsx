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
      { route: "/bookmarks", locale: "ko" },
    );

    expect(screen.getByText("저장된 인터뷰 북마크")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "북마크 검색" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "저장 질문" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /네트워크 지터 상황에서도 Redis 락 갱신이 실패할 수 있는 이유 설명하기/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "질문 연습" })).toHaveAttribute(
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
      { route: "/bookmarks", locale: "ko" },
    );

    expect(document.querySelector(".bookmarks-layout--desktop")).not.toBeNull();
  });
});
