import { MetricCard } from "../../../shared/ui/MetricCard";
import { findFirstReviewSignalLine } from "../editorUtils";
import type { EditorViewProps } from "../editorViewProps";

export function ReviewFocusCard({ ctrl, workspace }: EditorViewProps) {
  const {
    isKorean,
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
          <p className="section-heading__eyebrow">{isKorean ? "리뷰 포커스" : "Review focus"}</p>
          <h2 className="page-card__title">
            {isKorean
              ? "면접 압박을 받는다는 가정으로 읽고 가장 약한 주장부터 표시하세요"
              : "Read the draft like interview pressure, then annotate the weakest claims"}
          </h2>
        </div>
        <span className="detail-chip">{isKorean ? "리뷰 모드" : "Review mode"}</span>
      </div>
      <div className="stats-grid">
        <MetricCard
          label={isKorean ? "댓글" : "Comments"}
          tone="accent"
          value={String(workspace.commentSummary.totalCount)}
        />
        <MetricCard
          label={isKorean ? "질문 카드" : "Question cards"}
          tone="muted"
          value={String(workspace.questionCardSummary.totalCount)}
        />
        <MetricCard
          label={isKorean ? "제안" : "Suggestions"}
          tone="muted"
          value={String(
            (questionSuggestionsMutation.data?.suggestions.length ?? 0) +
              (rewriteSuggestionsMutation.data?.suggestions.length ?? 0),
          )}
        />
      </div>
      <p className="resume-tailor-muted">
        {isKorean
          ? "먼저 읽기 화면과 핫스팟 이동으로 약한 줄을 찾고, 어디를 고칠지 분명해졌을 때만 전체 도구를 여세요."
          : "Start with the reading surface and hotspot navigation, then open full tools only when the weak line is clear enough to fix."}
      </p>
      <div className="page-card__actions">
        <span className="detail-chip">
          {isKorean
            ? `핫스팟 ${reviewHotspotLineIndexes.length}개`
            : `${reviewHotspotLineIndexes.length} hotspot${reviewHotspotLineIndexes.length === 1 ? "" : "s"}`}
        </span>
        <button
          className="secondary-button"
          disabled={reviewHotspotLineIndexes.length === 0}
          onClick={() => focusReviewHotspot("previous")}
          type="button"
        >
          {isKorean ? "이전 핫스팟" : "Previous hotspot"}
        </button>
        <button
          className="secondary-button"
          disabled={reviewHotspotLineIndexes.length === 0}
          onClick={() => focusReviewHotspot("next")}
          type="button"
        >
          {isKorean ? "다음 핫스팟" : "Next hotspot"}
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
            {isKorean ? "도구 열기" : "Open tools"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
