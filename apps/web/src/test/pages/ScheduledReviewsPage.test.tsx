import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ScheduledReviewsPage } from "../../pages/scheduled-reviews/ScheduledReviewsPage";
import { mockMatchMedia, renderWithProviders } from "../utils";

describe("ScheduledReviewsPage", () => {
  it("renders the scheduled review board with calendar, timeline, and queue", () => {
    renderWithProviders(
      <Routes>
        <Route element={<ScheduledReviewsPage />} path="/scheduled-reviews" />
      </Routes>,
      { route: "/scheduled-reviews" },
    );

    expect(screen.getByText("Scheduled review board")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /next seven days of review pressure/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /review blocks ordered by upcoming due date/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /reschedule, complete, or open the next review block/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Complete" }).length).toBeGreaterThan(0);
  });

  it("reschedules and completes blocks from the queue", () => {
    renderWithProviders(
      <Routes>
        <Route element={<ScheduledReviewsPage />} path="/scheduled-reviews" />
      </Routes>,
      { route: "/scheduled-reviews" },
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Reschedule" })[0]);
    expect(screen.getByText("Review block rescheduled to Aug 31, 2026.")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Complete" })[0]);
    expect(screen.getByText("Review block marked complete and removed from the upcoming schedule.")).toBeInTheDocument();
  });

  it("renders the desktop scheduled review layout when wide mode is active", () => {
    mockMatchMedia(true);

    renderWithProviders(
      <Routes>
        <Route element={<ScheduledReviewsPage />} path="/scheduled-reviews" />
      </Routes>,
      { route: "/scheduled-reviews" },
    );

    expect(document.querySelector(".scheduled-reviews-layout--desktop")).not.toBeNull();
  });
});
