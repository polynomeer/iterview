import { Button } from "../../../shared/ui/primitives";
import type { EditorControllerProps } from "../editorViewProps";

export function InlineSuggestionPreviews({ ctrl }: EditorControllerProps) {
  const {
    t,
    selectedBlock,
    currentSelectionAnchor,
    setActiveSidePanel,
    setIsContextPanelOpen,
    createQuestionCardMutation,
    questionSuggestionsMutation,
    rewriteSuggestionsMutation,
    inlineSuggestionPreview,
    handleApplyRewrite,
  } = ctrl;

  return (
    <>
      {inlineSuggestionPreview === "question" ? (
        <article className="resume-editor-inline-preview">
          <div className="editor-head">
            <h3 className="editor-heading">{t("resumeEditor.inlineQuestionSuggestions")}</h3>
            <Button
              onClick={() => {
                setActiveSidePanel("suggestions");
                setIsContextPanelOpen(true);
              }}
              size="sm"
              variant="ghost"
            >
              {t("resumeEditor.openFullPanel")}
            </Button>
          </div>
          {questionSuggestionsMutation.isPending ? (
            <p className="editor-muted">{t("resumeEditor.generatingQuestionSuggestions")}</p>
          ) : questionSuggestionsMutation.data ? (
            <div className="editor-stack">
              {questionSuggestionsMutation.data.suggestions.slice(0, 2).map((suggestion) => (
                <article className="editor-item" key={suggestion.id}>
                  <p className="editor-label">{suggestion.questionTypeLabel}</p>
                  <h4 className="editor-heading">{suggestion.title}</h4>
                  <p className="editor-text editor-preserve">
                    {suggestion.questionText}
                  </p>
                  <div className="editor-actions">
                    <Button
                      onClick={() => {
                        void createQuestionCardMutation.mutateAsync({
                          blockId: selectedBlock?.blockId ?? null,
                          selectionAnchor:
                            questionSuggestionsMutation.data?.selectionAnchor ??
                            currentSelectionAnchor,
                          fieldPath:
                            questionSuggestionsMutation.data?.selectionAnchor?.fieldPath ??
                            currentSelectionAnchor?.fieldPath ??
                            selectedBlock?.fieldPath ??
                            null,
                          selectedText: questionSuggestionsMutation.data?.selectedText || null,
                          title: suggestion.title,
                          questionText: suggestion.questionText,
                          questionType: suggestion.questionType,
                          linkedQuestionId: null,
                          followUpSuggestions: suggestion.followUpSuggestions,
                        });
                      }}
                      size="sm"
                    >
                      {t("resumeEditor.createCard")}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </article>
      ) : null}
      {inlineSuggestionPreview === "rewrite" ? (
        <article className="resume-editor-inline-preview">
          <div className="editor-head">
            <h3 className="editor-heading">{t("resumeEditor.inlineRewriteSuggestions")}</h3>
            <Button
              onClick={() => {
                setActiveSidePanel("suggestions");
                setIsContextPanelOpen(true);
              }}
              size="sm"
              variant="ghost"
            >
              {t("resumeEditor.openFullPanel")}
            </Button>
          </div>
          {rewriteSuggestionsMutation.isPending ? (
            <p className="editor-muted">{t("resumeEditor.generatingRewriteSuggestions")}</p>
          ) : rewriteSuggestionsMutation.data ? (
            <div className="editor-stack">
              {rewriteSuggestionsMutation.data.suggestions.slice(0, 2).map((suggestion) => (
                <article className="editor-item" key={suggestion.id}>
                  <p className="editor-label">
                    {suggestion.focusArea ?? (t("resumeEditor.rewriteSuggestion"))}
                  </p>
                  <p className="editor-text editor-preserve">
                    {suggestion.suggestedText}
                  </p>
                  <div className="editor-actions">
                    <Button
                      onClick={() => {
                        void handleApplyRewrite(suggestion.suggestedText);
                      }}
                      size="sm"
                    >
                      {t("resumeEditor.applyRewrite")}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </article>
      ) : null}
    </>
  );
}
