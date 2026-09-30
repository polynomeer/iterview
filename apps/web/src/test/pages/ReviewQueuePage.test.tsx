import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ReviewQueuePage } from "../../pages/review-queue/ReviewQueuePage";
import { useReviewQueueActionMutation } from "../../features/review-queue/api/useReviewQueueActionMutation";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { LocationDisplay, mockMatchMedia, renderWithProviders } from "../utils";

vi.mock("../../features/review-queue/api/useReviewQueueQuery", () => ({
  useReviewQueueQuery: vi.fn(),
}));

vi.mock("../../features/review-queue/api/useReviewQueueActionMutation", () => ({
  useReviewQueueActionMutation: vi.fn(),
}));

describe("ReviewQueuePage", () => {
  it("renders the queue items and desktop layout", () => {
    mockMatchMedia(true);
    vi.mocked(useReviewQueueQuery).mockReturnValue({
      data: {
        items: [
          {
            id: "queue-1",
            questionId: "question-9",
            questionTitle: "Explain how you debugged a latency spike",
            reasonTypeLabel: "Scheduled review",
            priorityLabel: "High priority",
            scheduledLabel: "Today",
            relatedSkillLabels: [],
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useReviewQueueActionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<ReviewQueuePage />} path="/review" />
      </Routes>,
      { route: "/review" },
    );

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Explain how you debugged a latency spike",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Resolve queued retry branches" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Clear the smallest high-signal retry first",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "One connected preparation loop" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Weak nodes/i })).not.toBeInTheDocument();
    expect(document.querySelector(".review-queue-layout--desktop")).not.toBeNull();
  });

  it("routes finished work from the queue into the archive", async () => {
    vi.mocked(useReviewQueueQuery).mockReturnValue({
      data: {
        items: [
          {
            id: "queue-1",
            questionId: "question-9",
            questionTitle: "Explain how you debugged a latency spike",
            reasonTypeLabel: "Scheduled review",
            priorityLabel: "High priority",
            scheduledLabel: "Today",
            relatedSkillLabels: [],
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useReviewQueueActionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);

    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route
          element={
            <>
              <ReviewQueuePage />
              <LocationDisplay />
            </>
          }
          path="/review"
        />
        <Route element={<LocationDisplay />} path="/review/done" />
      </Routes>,
      { route: "/review" },
    );

    await user.click(screen.getByRole("link", { name: /Archive/ }));

    expect(screen.getByTestId("location-display")).toHaveTextContent("/review/done");
  });
});
