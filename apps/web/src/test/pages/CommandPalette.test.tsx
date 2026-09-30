import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePracticeQuestionsQuery } from "../../features/practice/api/usePracticeQuestionsQuery";
import { useLatestResumeQuery } from "../../features/resume/api/useLatestResumeQuery";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { CommandPalette } from "../../widgets/layout/CommandPalette";
import { LocationDisplay, renderWithProviders } from "../utils";

vi.mock("../../features/practice/api/usePracticeQuestionsQuery", () => ({ usePracticeQuestionsQuery: vi.fn() }));
vi.mock("../../features/resume/api/useLatestResumeQuery", () => ({ useLatestResumeQuery: vi.fn() }));
vi.mock("../../features/review-queue/api/useReviewQueueQuery", () => ({ useReviewQueueQuery: vi.fn() }));

beforeEach(() => {
  vi.mocked(usePracticeQuestionsQuery).mockImplementation(
    (params) =>
      ({
        isFetching: false,
        isError: false,
        data: params.search
          ? {
              items: [
                { id: "21", title: "트랜잭션 전파 속성 REQUIRES_NEW", categoryLabel: "Spring", difficultyLabel: "MEDIUM", relatedSkillLabels: [] },
              ],
            }
          : undefined,
      }) as never,
  );
  vi.mocked(useReviewQueueQuery).mockReturnValue({
    data: {
      items: [
        { id: "1", questionId: "11", questionTitle: "Self-invocation 시 @Transactional이 무시되는 이유", reasonTypeLabel: "낮은 점수", relatedSkillLabels: ["Spring"] },
      ],
    },
  } as never);
  vi.mocked(useLatestResumeQuery).mockReturnValue({
    data: { items: [{ id: "1", title: "백엔드 이력서", versions: [{ id: "3", versionNumberLabel: "v3", isActive: true }] }] },
  } as never);
});

function renderPalette(extraRoute: string) {
  const onClose = vi.fn();
  renderWithProviders(
    <Routes>
      <Route
        element={
          <>
            <CommandPalette isOpen onClose={onClose} />
            <LocationDisplay />
          </>
        }
        path="/"
      />
      <Route element={<LocationDisplay />} path={extraRoute} />
    </Routes>,
    { locale: "ko" },
  );
  return onClose;
}

describe("CommandPalette", () => {
  it("opens on real destinations: menus, due reviews, and the active resume", () => {
    renderPalette("/review");

    const results = screen.getByRole("listbox", { name: "검색 결과" });
    expect(within(results).getByRole("group", { name: "이동" })).toHaveTextContent("지금 복습");
    expect(within(results).getByRole("group", { name: "지금 복습" })).toHaveTextContent("Self-invocation");
    expect(within(results).getByRole("group", { name: "활성 이력서" })).toHaveTextContent("이력서 근거");
    expect(within(results).getAllByRole("group").map((group) => group.getAttribute("aria-label"))).toEqual([
      "지금 복습",
      "활성 이력서",
      "이동",
    ]);
    // No question request until the user types.
    expect(usePracticeQuestionsQuery).toHaveBeenLastCalledWith({ search: "" }, { enabled: false });
  });

  it("searches questions on the server and lists them first", async () => {
    const user = userEvent.setup();
    renderPalette("/questions/:questionId");

    await user.type(screen.getByRole("combobox", { name: "Iterview 검색" }), "트랜잭션");

    const firstGroup = await screen.findByRole("group", { name: "질문" });
    expect(firstGroup).toHaveTextContent("트랜잭션 전파 속성 REQUIRES_NEW");
    expect(usePracticeQuestionsQuery).toHaveBeenLastCalledWith({ search: "트랜잭션" }, { enabled: true });
    expect(screen.getAllByRole("group")[0]).toBe(firstGroup);
  });

  it("navigates to the selected result with the keyboard", async () => {
    const user = userEvent.setup();
    const onClose = renderPalette("/review");

    await user.type(screen.getByRole("combobox", { name: "Iterview 검색" }), "지금 복습");
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("location-display")).toHaveTextContent("/review");
    expect(onClose).toHaveBeenCalled();
  });

  it("opens the active resume evidence from a result", async () => {
    const user = userEvent.setup();
    renderPalette("/resume/:versionId/claims");

    await user.click(screen.getByRole("option", { name: /이력서 근거/ }));

    expect(screen.getByTestId("location-display")).toHaveTextContent("/resume/3/claims");
  });

  it("keeps focus inside the dialog and restores it when closed", async () => {
    const onClose = vi.fn();
    const { rerender } = renderWithProviders(
      <>
        <button type="button">Open command palette</button>
        <CommandPalette isOpen={false} onClose={onClose} />
      </>,
    );
    const trigger = screen.getByRole("button", { name: "Open command palette" });
    trigger.focus();

    rerender(
      <>
        <button type="button">Open command palette</button>
        <CommandPalette isOpen onClose={onClose} />
      </>,
    );

    const searchInput = screen.getByRole("combobox", { name: "Search Iterview" });
    await waitFor(() => expect(searchInput).toHaveFocus());

    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement).toHaveAttribute("role", "option");

    rerender(
      <>
        <button type="button">Open command palette</button>
        <CommandPalette isOpen={false} onClose={onClose} />
      </>,
    );

    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
