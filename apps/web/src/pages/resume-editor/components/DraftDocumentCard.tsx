import { FallbackBlocks } from "./FallbackBlocks";
import { SelectionInspector } from "./SelectionInspector";
import { EditTab } from "./tabs/EditTab";
import { ReviewTab } from "./tabs/ReviewTab";
import type { EditorControllerProps } from "../editorViewProps";

export function DraftDocumentCard({ ctrl }: EditorControllerProps) {
  const {
    t,
    currentTab,
    selectedBlock,
    selectedNode,
    richTreeEnabled,
    isContextPanelOpen,
    setIsContextPanelOpen,
  } = ctrl;

  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{t("resumeEditor.draftDocument")}</p>
          <h2 className="page-card__title">
            {currentTab === "review"
              ? t("resumeEditor.reviewReadingSurface")
              : richTreeEnabled
                ? t("resumeEditor.singleSurfaceEditorRichTree")
                : t("resumeEditor.singleSurfaceEditor")}
          </h2>
        </div>
        <div className="resume-status-badges">
          <span className="detail-chip">
            {currentTab === "review" ? (t("resumeEditor.reviewMode")) : t("resumeEditor.rowEditor")}
          </span>
          {selectedBlock || selectedNode ? (
            <>
              <span className="question-status-badge question-status-badge--neutral">
                {t("resumeEditor.selected")} {richTreeEnabled ? selectedNode?.nodeTypeLabel : selectedBlock?.blockType}
              </span>
              <button
                className="secondary-button"
                onClick={() => setIsContextPanelOpen((current) => !current)}
                type="button"
              >
                {isContextPanelOpen
                  ? t("resumeEditor.hideTools")
                  : t("resumeEditor.openTools")}
              </button>
            </>
          ) : null}
        </div>
      </div>
      <div className="resume-editor-surface">
        {currentTab !== "review" ? <EditTab ctrl={ctrl} /> : null}
        {currentTab === "review" ? <ReviewTab ctrl={ctrl} /> : null}
      </div>
      {selectedBlock || selectedNode ? <SelectionInspector ctrl={ctrl} /> : null}
      <FallbackBlocks ctrl={ctrl} />
    </section>
  );
}
