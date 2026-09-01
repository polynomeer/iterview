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
        <Route element={<ReviewQueuePage />} path="/review-queue" />
      </Routes>,
      { route: "/review-queue" },
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
    expect(screen.getAllByRole("link", { name: /Weak nodes/i }).length).toBeGreaterThanOrEqual(1);
    expect(document.querySelector(".review-queue-layout--desktop")).not.toBeNull();
  });

  it("routes remediation work from the queue into the weak nodes workspace", async () => {
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
          path="/review-queue"
        />
        <Route element={<LocationDisplay />} path="/weak-nodes" />
      </Routes>,
      { route: "/review-queue" },
    );

    await user.click(screen.getByRole("link", { name: "Open weak nodes" }));

    expect(screen.getByTestId("location-display")).toHaveTextContent("/weak-nodes");
  });
});
