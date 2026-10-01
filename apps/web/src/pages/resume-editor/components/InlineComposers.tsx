import { Button, Field, Input, Textarea } from "../../../shared/ui/primitives";
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
            <h3 className="editor-heading">{t("resumeEditor.commentOnCurrentSelection")}</h3>
            <Button
              aria-label={t("resumeEditor.closeInlineComment")}
              onClick={() => setInlineComposerMode(null)}
              size="sm"
              variant="ghost"
            >
              {t("resumeEditor.close")}
            </Button>
          </div>
          {effectiveSelectedText ? (
            <p className="resume-editor-inline-composer__meta">
              {t("resumeEditor.selection")} {effectiveSelectedText}
            </p>
          ) : null}
          <Field label={t("resumeEditor.comment")}>
            {(control) => (
              <Textarea
                {...control}
                aria-label={t("resumeEditor.inlineComment")}
                className="editor-textarea"
                onChange={(event) => setInlineCommentBody(event.target.value)}
                rows={3}
                value={inlineCommentBody}
              />
            )}
          </Field>
          <div className="editor-actions resume-editor-inline-composer__actions">
            <Button
              disabled={
                createCommentMutation.isPending ||
                (!selectedBlock && !currentSelectionAnchor) ||
                !inlineCommentBody.trim()
              }
              onClick={() => {
                void submitInlineComment();
              }}
              size="sm"
              variant="primary"
            >
              {t("resumeEditor.saveInlineComment")}
            </Button>
            <Button
              onClick={() => {
                setActiveSidePanel("comments");
                setIsContextPanelOpen(true);
              }}
              size="sm"
            >
              {t("resumeEditor.openFullPanel")}
            </Button>
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
            <h3 className="editor-heading">{t("resumeEditor.inlineQuestionCard")}</h3>
            <Button
              aria-label={t("resumeEditor.closeInlineQuestionCard")}
              onClick={() => setInlineComposerMode(null)}
              size="sm"
              variant="ghost"
            >
              {t("resumeEditor.close")}
            </Button>
          </div>
          {effectiveSelectedText ? (
            <p className="resume-editor-inline-composer__meta">
              {t("resumeEditor.selection")} {effectiveSelectedText}
            </p>
          ) : null}
          <Field label={t("resumeEditor.title")}>
            {(control) => (
              <Input
                {...control}
                aria-label={t("resumeEditor.inlineQuestionCardTitle")}
                onChange={(event) => setInlineCardTitle(event.target.value)}
                value={inlineCardTitle}
              />
            )}
          </Field>
          <Field label={t("resumeEditor.questionText")}>
            {(control) => (
              <Textarea
                {...control}
                aria-label={t("resumeEditor.inlineQuestionCardText")}
                className="editor-textarea"
                onChange={(event) => setInlineCardText(event.target.value)}
                rows={3}
                value={inlineCardText}
              />
            )}
          </Field>
          <div className="editor-actions resume-editor-inline-composer__actions">
            <Button
              disabled={
                createQuestionCardMutation.isPending ||
                (!selectedBlock && !currentSelectionAnchor) ||
                !inlineCardText.trim()
              }
              onClick={() => {
                void submitInlineQuestionCard();
              }}
              size="sm"
              variant="primary"
            >
              {t("resumeEditor.saveInlineCard")}
            </Button>
            <Button
              onClick={() => {
                setActiveSidePanel("question-cards");
                setIsContextPanelOpen(true);
              }}
              size="sm"
            >
              {t("resumeEditor.openFullPanel")}
            </Button>
          </div>
        </article>
      ) : null}
    </>
  );
}
