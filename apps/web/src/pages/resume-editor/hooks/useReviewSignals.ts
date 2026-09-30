import { useEffect, useMemo, useState } from "react";
import type { useResumeEditorWorkspaceQuery } from "../../../features/resume-editor/api/useResumeEditorWorkspaceQuery";
import type { EditorTab, ReviewSignalType, ReviewSummaryItem } from "../editorTypes";
import { buildPreviewReviewSignals } from "../editorUtils";
import type { useEditorAnnotations } from "./useEditorAnnotations";

/** Per-line review signals, hotspot navigation, and the review summary cards. */
export function useReviewSignals({
  currentTab,
  isKorean,
  markdownSource,
  workspaceQuery,
  questionSuggestionsMutation,
  rewriteSuggestionsMutation,
}: {
  currentTab: EditorTab;
  isKorean: boolean;
  markdownSource: string;
  workspaceQuery: ReturnType<typeof useResumeEditorWorkspaceQuery>;
  questionSuggestionsMutation: ReturnType<typeof useEditorAnnotations>["questionSuggestionsMutation"];
  rewriteSuggestionsMutation: ReturnType<typeof useEditorAnnotations>["rewriteSuggestionsMutation"];
}) {
  const [focusedReviewLineIndex, setFocusedReviewLineIndex] = useState<number | null>(null);

  useEffect(() => {
    if (currentTab !== "review" || focusedReviewLineIndex === null) {
      return;
    }

    const targetRow = document.querySelector<HTMLElement>(
      `.resume-editor-document-preview__row[data-line-index="${focusedReviewLineIndex}"]`,
    );

    if (!targetRow) {
      return;
    }

    targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentTab, focusedReviewLineIndex]);

  const contextualSummaryItems: ReviewSummaryItem[] = workspaceQuery.data
    ? [
        {
          panelId: "comments" as ReviewSignalType,
          label: isKorean ? "댓글" : "Comments",
          value: String(workspaceQuery.data.commentSummary.totalCount),
          helper:
            workspaceQuery.data.commentSummary.openCount > 0
              ? isKorean
                ? `${workspaceQuery.data.commentSummary.openCount}개 열림`
                : `${workspaceQuery.data.commentSummary.openCount} open`
              : isKorean
                ? "열린 스레드 없음"
                : "No open threads",
        },
        {
          panelId: "question-cards" as ReviewSignalType,
          label: isKorean ? "카드" : "Cards",
          value: String(workspaceQuery.data.questionCardSummary.totalCount),
          helper:
            workspaceQuery.data.questionCardSummary.activeCount > 0
              ? isKorean
                ? `${workspaceQuery.data.questionCardSummary.activeCount}개 활성`
                : `${workspaceQuery.data.questionCardSummary.activeCount} active`
              : isKorean
                ? "활성 카드 없음"
                : "No active cards",
        },
        {
          panelId: "suggestions" as ReviewSignalType,
          label: isKorean ? "제안" : "Suggestions",
          value: String(
            (questionSuggestionsMutation.data?.suggestions.length ?? 0) +
              (rewriteSuggestionsMutation.data?.suggestions.length ?? 0),
          ),
          helper:
            questionSuggestionsMutation.data || rewriteSuggestionsMutation.data
              ? isKorean
                ? "최근 결과"
                : "Recent results"
              : isKorean
                ? "필요할 때 생성"
                : "Generate on demand",
        },
      ]
    : [];
  const previewReviewSignals = useMemo(
    () =>
      workspaceQuery.data
        ? buildPreviewReviewSignals(
            markdownSource,
            workspaceQuery.data.comments,
            workspaceQuery.data.questionCards,
            (questionSuggestionsMutation.data?.suggestions.length ?? 0) +
              (rewriteSuggestionsMutation.data?.suggestions.length ?? 0),
          )
        : [],
    [
      markdownSource,
      questionSuggestionsMutation.data,
      rewriteSuggestionsMutation.data,
      workspaceQuery.data,
    ],
  );
  const reviewHotspotLineIndexes = useMemo(
    () =>
      previewReviewSignals
        .map((signal, index) =>
          signal.commentCount > 0 || signal.cardCount > 0 || signal.suggestionCount > 0 ? index : null,
        )
        .filter((index): index is number => index !== null),
    [previewReviewSignals],
  );

  function focusReviewHotspot(direction: "next" | "previous") {
    if (reviewHotspotLineIndexes.length === 0) {
      return;
    }

    if (focusedReviewLineIndex === null) {
      setFocusedReviewLineIndex(
        direction === "next"
          ? reviewHotspotLineIndexes[0]
          : reviewHotspotLineIndexes[reviewHotspotLineIndexes.length - 1],
      );
      return;
    }

    const currentIndex = reviewHotspotLineIndexes.findIndex((lineIndex) => lineIndex === focusedReviewLineIndex);

    if (currentIndex < 0) {
      setFocusedReviewLineIndex(reviewHotspotLineIndexes[0]);
      return;
    }

    const nextIndex =
      direction === "next"
        ? Math.min(reviewHotspotLineIndexes.length - 1, currentIndex + 1)
        : Math.max(0, currentIndex - 1);

    setFocusedReviewLineIndex(reviewHotspotLineIndexes[nextIndex]);
  }

  return {
    focusedReviewLineIndex,
    setFocusedReviewLineIndex,
    contextualSummaryItems,
    previewReviewSignals,
    reviewHotspotLineIndexes,
    focusReviewHotspot,
  };
}
