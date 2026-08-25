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
      { route: "/target-companies" },
    );

    expect(screen.getByText("Company preparation board")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search target companies" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /prioritize by preparation pressure/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Company board" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Review imported job postings/i })).toHaveAttribute(
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
      { route: "/target-companies" },
    );

    expect(document.querySelector(".target-companies-layout--desktop")).not.toBeNull();
  });
});
