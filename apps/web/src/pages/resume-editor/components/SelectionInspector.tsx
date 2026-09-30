import { renderAnnotatedText } from "./markdownPreview";
import type { EditorControllerProps } from "../editorViewProps";

export function SelectionInspector({ ctrl }: EditorControllerProps) {
  const {
    t,
    currentTab,
    selectedMarkdownRange,
    selectedBlock,
    effectiveSelectedText,
    currentSelectionAnchor,
  } = ctrl;

  return (
    <div className="resume-editor-selection">
      <span className="detail-chip">
        {selectedMarkdownRange
          ? t("resumeEditor.markdownSelectionRange", {
              start: selectedMarkdownRange.startOffset,
              end: selectedMarkdownRange.endOffset,
            })
          : t("resumeEditor.noTextRangeSelected")}
      </span>
      <p className="resume-tailor-muted">
        {effectiveSelectedText
          ? t("resumeEditor.currentExcerpt", { text: effectiveSelectedText })
          : currentTab === "review"
            ? t("resumeEditor.reviewNoSelectionHint")
            : t("resumeEditor.editNoSelectionHint")}
      </p>
      {effectiveSelectedText && currentTab !== "review" ? (
        <p className="resume-tailor-muted">
          {t("resumeEditor.selectionAttachHint")}
        </p>
      ) : null}
      {currentSelectionAnchor?.nodeId ? (
        <div className="filter-chip-row">
          <span className="detail-chip">{t("resumeEditor.node")} {currentSelectionAnchor.nodeId}</span>
          {currentSelectionAnchor.fieldPath ? (
            <span className="detail-chip">{currentSelectionAnchor.fieldPath}</span>
          ) : null}
        </div>
      ) : null}
      {selectedBlock ? (
        <article className="page-card page-card--muted resume-editor-annotated-text">
          <p className="section-heading__eyebrow">{t("resumeEditor.annotatedPreview")}</p>
          <div className="page-card__body resume-section__body--preserve">
            {renderAnnotatedText(
              selectedBlock.text,
              selectedBlock.inlineMarks,
              null,
            )}
          </div>
        </article>
      ) : null}
    </div>
  );
}
