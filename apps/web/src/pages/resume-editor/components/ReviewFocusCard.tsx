import { Button, Card, Stat } from "../../../shared/ui/primitives";
import type { EditorViewProps } from "../editorViewProps";
import { ContextSummaryCards } from "./ContextRail";

/** Review mode: annotation counts and a way to step through the lines that drew them. */
export function ReviewFocusCard({ ctrl, workspace }: EditorViewProps) {
  const {
    t,
    selectedBlock,
    selectedNode,
    questionSuggestionsMutation,
    rewriteSuggestionsMutation,
    reviewHotspotLineIndexes,
    focusReviewHotspot,
  } = ctrl;
  const suggestionCount =
    (questionSuggestionsMutation.data?.suggestions.length ?? 0) + (rewriteSuggestionsMutation.data?.suggestions.length ?? 0);
  const hotspots = reviewHotspotLineIndexes.length;

  return (
    <Card aria-label={t("resumeEditor.reviewFocus")} padded>
      <div className="editor-stack">
        {/* With a selection, the summary cards below carry the same counts and open their panels. */}
        {selectedBlock || selectedNode ? null : (
          <div className="editor-stats">
            <Stat label={t("resumeEditor.comments")} value={workspace.commentSummary.totalCount} />
            <Stat label={t("resumeEditor.questionCards")} value={workspace.questionCardSummary.totalCount} />
            <Stat label={t("resumeEditor.suggestions")} value={suggestionCount} />
          </div>
        )}
        <div className="editor-actions">
          <span className="editor-muted">
            {t(hotspots === 1 ? "resumeEditor.hotspotCountOne" : "resumeEditor.hotspotCountOther", { count: hotspots })}
          </span>
          <Button disabled={hotspots === 0} onClick={() => focusReviewHotspot("previous")} size="sm">
            {t("resumeEditor.previousHotspot")}
          </Button>
          <Button disabled={hotspots === 0} onClick={() => focusReviewHotspot("next")} size="sm">
            {t("resumeEditor.nextHotspot")}
          </Button>
        </div>
        {selectedBlock || selectedNode ? <ContextSummaryCards ctrl={ctrl} /> : null}
      </div>
    </Card>
  );
}

