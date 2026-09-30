import { useEffect, useMemo, useState } from "react";
import { useLocale } from "../../../shared/i18n";
import type { useResumeEditorWorkspaceQuery } from "../../../features/resume-editor/api/useResumeEditorWorkspaceQuery";
import type { EditorTab, ReviewSignalType, ReviewSummaryItem } from "../editorTypes";
import { buildPreviewReviewSignals } from "../editorUtils";
import type { useEditorAnnotations } from "./useEditorAnnotations";

/** Per-line review signals, hotspot navigation, and the review summary cards. */
export function useReviewSignals({
  currentTab,
  markdownSource,
  workspaceQuery,
  questionSuggestionsMutation,
  rewriteSuggestionsMutation,
}: {
  currentTab: EditorTab;
  markdownSource: string;
  workspaceQuery: ReturnType<typeof useResumeEditorWorkspaceQuery>;
  questionSuggestionsMutation: ReturnType<typeof useEditorAnnotations>["questionSuggestionsMutation"];
  rewriteSuggestionsMutation: ReturnType<typeof useEditorAnnotations>["rewriteSuggestionsMutation"];
}) {
  const { t } = useLocale();
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
          label: t("resumeEditor.comments"),
          value: String(workspaceQuery.data.commentSummary.totalCount),
          helper:
            workspaceQuery.data.commentSummary.openCount > 0
              ? t("resumeEditor.openThreadCount", { count: workspaceQuery.data.commentSummary.openCount })
              : t("resumeEditor.noOpenThreads"),
        },
        {
          panelId: "question-cards" as ReviewSignalType,
          label: t("resumeEditor.cards"),
          value: String(workspaceQuery.data.questionCardSummary.totalCount),
          helper:
            workspaceQuery.data.questionCardSummary.activeCount > 0
              ? t("resumeEditor.activeCardCount", { count: workspaceQuery.data.questionCardSummary.activeCount })
              : t("resumeEditor.noActiveCards"),
        },
        {
          panelId: "suggestions" as ReviewSignalType,
          label: t("resumeEditor.suggestions"),
          value: String(
            (questionSuggestionsMutation.data?.suggestions.length ?? 0) +
              (rewriteSuggestionsMutation.data?.suggestions.length ?? 0),
          ),
          helper:
            questionSuggestionsMutation.data || rewriteSuggestionsMutation.data
              ? t("resumeEditor.recentResults")
              : t("resumeEditor.generateOnDemand"),
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
