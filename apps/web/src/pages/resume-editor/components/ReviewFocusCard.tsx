import { MetricCard } from "../../../shared/ui/MetricCard";
import { findFirstReviewSignalLine } from "../editorUtils";
import type { EditorViewProps } from "../editorViewProps";

export function ReviewFocusCard({ ctrl, workspace }: EditorViewProps) {
  const {
    t,
    selectedBlock,
    selectedNode,
    setActiveSidePanel,
    setIsContextPanelOpen,
    setIsSecondaryToolsOpen,
    questionSuggestionsMutation,
    rewriteSuggestionsMutation,
    setFocusedReviewLineIndex,
    contextualSummaryItems,
    previewReviewSignals,
    reviewHotspotLineIndexes,
    focusReviewHotspot,
  } = ctrl;

  return (
    <section className="page-card page-card--muted">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{t("resumeEditor.reviewFocus")}</p>
          <h2 className="page-card__title">
            {t("resumeEditor.reviewFocusTitle")}
          </h2>
        </div>
        <span className="detail-chip">{t("resumeEditor.reviewMode")}</span>
      </div>
      <div className="stats-grid">
        <MetricCard
          label={t("resumeEditor.comments")}
          tone="accent"
          value={String(workspace.commentSummary.totalCount)}
        />
        <MetricCard
          label={t("resumeEditor.questionCards")}
          tone="muted"
          value={String(workspace.questionCardSummary.totalCount)}
        />
        <MetricCard
          label={t("resumeEditor.suggestions")}
          tone="muted"
          value={String(
            (questionSuggestionsMutation.data?.suggestions.length ?? 0) +
              (rewriteSuggestionsMutation.data?.suggestions.length ?? 0),
          )}
        />
      </div>
      <p className="resume-tailor-muted">
        {t("resumeEditor.reviewFocusHint")}
      </p>
      <div className="page-card__actions">
        <span className="detail-chip">
          {t(
            reviewHotspotLineIndexes.length === 1 ? "resumeEditor.hotspotCountOne" : "resumeEditor.hotspotCountOther",
            { count: reviewHotspotLineIndexes.length },
          )}
        </span>
        <button
          className="secondary-button"
          disabled={reviewHotspotLineIndexes.length === 0}
          onClick={() => focusReviewHotspot("previous")}
          type="button"
        >
          {t("resumeEditor.previousHotspot")}
        </button>
        <button
          className="secondary-button"
          disabled={reviewHotspotLineIndexes.length === 0}
          onClick={() => focusReviewHotspot("next")}
          type="button"
        >
          {t("resumeEditor.nextHotspot")}
        </button>
      </div>
      {selectedBlock || selectedNode ? (
        <div className="resume-editor-contextual__summary resume-editor-review-summary">
          {contextualSummaryItems.map((item) => (
            <button
              className="resume-editor-contextual__summary-card"
              key={`review-${item.panelId}`}
              onClick={() => {
                const matchedLineIndex = findFirstReviewSignalLine(
                  previewReviewSignals,
                  item.panelId,
                );
                if (matchedLineIndex >= 0) {
                  setFocusedReviewLineIndex(matchedLineIndex);
                }
                setActiveSidePanel(item.panelId);
                setIsContextPanelOpen(true);
                setIsSecondaryToolsOpen(false);
              }}
              type="button"
            >
              <span className="resume-editor-contextual__summary-label">{item.label}</span>
              <strong className="resume-editor-contextual__summary-value">{item.value}</strong>
              <span className="resume-editor-contextual__summary-helper">{item.helper}</span>
            </button>
          ))}
          <button
            className="secondary-button"
            onClick={() => setIsContextPanelOpen(true)}
            type="button"
          >
            {t("resumeEditor.openTools")}
          </button>
        </div>
      ) : null}
    </section>
  );
}
