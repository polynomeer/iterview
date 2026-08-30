import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { TargetCompaniesPage } from "../../pages/target-companies/TargetCompaniesPage";
import { mockMatchMedia, renderWithProviders } from "../utils";

describe("TargetCompaniesPage", () => {
  it("renders the company preparation board with list and detail rail", () => {
    renderWithProviders(
      <Routes>
        <Route element={<TargetCompaniesPage />} path="/target-companies" />
      </Routes>,
      { route: "/target-companies", locale: "ko" },
    );

    expect(screen.getByText("회사 준비 보드")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "목표 회사 검색" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /준비 압박 기준으로 우선순위를 정하세요/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "회사 보드" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /가져온 채용공고 검토/i })).toHaveAttribute(
      "href",
      "/resume-tailor/job-postings",
    );
  });

  it("renders the desktop company board layout when wide mode is active", () => {
    mockMatchMedia(true);

    renderWithProviders(
      <Routes>
        <Route element={<TargetCompaniesPage />} path="/target-companies" />
      </Routes>,
      { route: "/target-companies", locale: "ko" },
    );

    expect(document.querySelector(".target-companies-layout--desktop")).not.toBeNull();
  });
});
