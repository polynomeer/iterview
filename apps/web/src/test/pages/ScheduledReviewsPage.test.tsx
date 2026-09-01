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
    expect(screen.getByRole("heading", { name: /shape this week's review pressure/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /a second pass over the sessions/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start review session" })).toHaveAttribute("href", "/review-queue");
    expect(screen.getByRole("link", { name: "Start review session" })).toBeInTheDocument();
  });

  it("reschedules and completes blocks from the queue", () => {
    renderWithProviders(
      <Routes>
        <Route element={<ScheduledReviewsPage />} path="/scheduled-reviews" />
      </Routes>,
      { route: "/scheduled-reviews" },
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Reschedule" })[0]);
    expect(screen.getByText("Review block rescheduled to Sep 2, 2026.")).toBeInTheDocument();

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
