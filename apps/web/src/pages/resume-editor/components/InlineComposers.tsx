import type { EditorControllerProps } from "../editorViewProps";

export function InlineComposers({ ctrl }: EditorControllerProps) {
  const {
    t,
    selectedBlock,
    effectiveSelectedText,
    currentSelectionAnchor,
    setActiveSidePanel,
    setIsContextPanelOpen,
    createCommentMutation,
    createQuestionCardMutation,
    inlineComposerMode,
    setInlineComposerMode,
    inlineCommentBody,
    setInlineCommentBody,
    inlineCardTitle,
    setInlineCardTitle,
    inlineCardText,
    setInlineCardText,
    submitInlineComment,
    submitInlineQuestionCard,
    editorPopoverPosition,
  } = ctrl;

  return (
    <>
      {inlineComposerMode === "comment" && editorPopoverPosition ? (
        <article
          aria-label={t("resumeEditor.inlineCommentPopover")}
          className="resume-editor-inline-preview resume-editor-inline-composer resume-editor-inline-composer--floating"
          role="dialog"
          style={{
            left: `${editorPopoverPosition.left}px`,
            top: `${editorPopoverPosition.top}px`,
          }}
        >
          <div className="resume-editor-inline-composer__header">
            <div>
              <p className="section-heading__eyebrow">{t("resumeEditor.inlineComment")}</p>
              <h3 className="page-card__title">{t("resumeEditor.commentOnCurrentSelection")}</h3>
            </div>
            <button
              aria-label={t("resumeEditor.closeInlineComment")}
              className="secondary-button"
              onClick={() => setInlineComposerMode(null)}
              type="button"
            >
              {t("resumeEditor.close")}
            </button>
          </div>
          {effectiveSelectedText ? (
            <p className="resume-editor-inline-composer__meta">
              {t("resumeEditor.selection")} {effectiveSelectedText}
            </p>
          ) : null}
          <label className="form-field">
            <span className="form-field__label">{t("resumeEditor.comment")}</span>
            <textarea
              aria-label={t("resumeEditor.inlineComment")}
              className="form-field__input form-input--textarea"
              onChange={(event) => setInlineCommentBody(event.target.value)}
              rows={3}
              value={inlineCommentBody}
            />
          </label>
          <div className="page-card__actions resume-editor-inline-composer__actions">
            <button
              className="primary-button"
              disabled={
                createCommentMutation.isPending ||
                (!selectedBlock && !currentSelectionAnchor) ||
                !inlineCommentBody.trim()
              }
              onClick={() => {
                void submitInlineComment();
              }}
              type="button"
            >
              {t("resumeEditor.saveInlineComment")}
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                setActiveSidePanel("comments");
                setIsContextPanelOpen(true);
              }}
              type="button"
            >
              {t("resumeEditor.openFullPanel")}
            </button>
          </div>
        </article>
      ) : null}
      {inlineComposerMode === "card" && editorPopoverPosition ? (
        <article
          aria-label={t("resumeEditor.inlineQuestionCardPopover")}
          className="resume-editor-inline-preview resume-editor-inline-composer resume-editor-inline-composer--floating"
          role="dialog"
          style={{
            left: `${editorPopoverPosition.left}px`,
            top: `${editorPopoverPosition.top}px`,
          }}
        >
          <div className="resume-editor-inline-composer__header">
            <div>
              <p className="section-heading__eyebrow">{t("resumeEditor.inlineQuestionCard")}</p>
              <h3 className="page-card__title">{t("resumeEditor.createPromptFromCurrentSelection")}</h3>
            </div>
            <button
              aria-label={t("resumeEditor.closeInlineQuestionCard")}
              className="secondary-button"
              onClick={() => setInlineComposerMode(null)}
              type="button"
            >
              {t("resumeEditor.close")}
            </button>
          </div>
          {effectiveSelectedText ? (
            <p className="resume-editor-inline-composer__meta">
              {t("resumeEditor.selection")} {effectiveSelectedText}
            </p>
          ) : null}
          <label className="form-field">
            <span className="form-field__label">{t("resumeEditor.title")}</span>
            <input
              aria-label={t("resumeEditor.inlineQuestionCardTitle")}
              className="form-field__input"
              onChange={(event) => setInlineCardTitle(event.target.value)}
              value={inlineCardTitle}
            />
          </label>
          <label className="form-field">
            <span className="form-field__label">{t("resumeEditor.questionText")}</span>
            <textarea
              aria-label={t("resumeEditor.inlineQuestionCardText")}
              className="form-field__input form-input--textarea"
              onChange={(event) => setInlineCardText(event.target.value)}
              rows={3}
              value={inlineCardText}
            />
          </label>
          <div className="page-card__actions resume-editor-inline-composer__actions">
            <button
              className="primary-button"
              disabled={
                createQuestionCardMutation.isPending ||
                (!selectedBlock && !currentSelectionAnchor) ||
                !inlineCardText.trim()
              }
              onClick={() => {
                void submitInlineQuestionCard();
              }}
              type="button"
            >
              {t("resumeEditor.saveInlineCard")}
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                setActiveSidePanel("question-cards");
                setIsContextPanelOpen(true);
              }}
              type="button"
            >
              {t("resumeEditor.openFullPanel")}
            </button>
          </div>
        </article>
      ) : null}
    </>
  );
}
