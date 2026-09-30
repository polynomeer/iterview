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
          <div className="section-heading">
            <div>
              <p className="section-heading__eyebrow">{t("resumeEditor.inlineQuestionSuggestions")}</p>
              <h3 className="page-card__title">{t("resumeEditor.selectionBasedPrompts")}</h3>
            </div>
            <button
              className="secondary-button"
              onClick={() => {
                setActiveSidePanel("suggestions");
                setIsContextPanelOpen(true);
              }}
              type="button"
            >
              {t("resumeEditor.openFullPanel")}
            </button>
          </div>
          {questionSuggestionsMutation.isPending ? (
            <p className="resume-tailor-muted">{t("resumeEditor.generatingQuestionSuggestions")}</p>
          ) : questionSuggestionsMutation.data ? (
            <div className="stack-list">
              {questionSuggestionsMutation.data.suggestions.slice(0, 2).map((suggestion) => (
                <article className="page-card page-card--muted" key={suggestion.id}>
                  <p className="section-heading__eyebrow">{suggestion.questionTypeLabel}</p>
                  <h4 className="page-card__title">{suggestion.title}</h4>
                  <p className="page-card__body resume-section__body--preserve">
                    {suggestion.questionText}
                  </p>
                  <div className="page-card__actions">
                    <button
                      className="secondary-button"
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
                      type="button"
                    >
                      {t("resumeEditor.createCard")}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </article>
      ) : null}
      {inlineSuggestionPreview === "rewrite" ? (
        <article className="resume-editor-inline-preview">
          <div className="section-heading">
            <div>
              <p className="section-heading__eyebrow">{t("resumeEditor.inlineRewriteSuggestions")}</p>
              <h3 className="page-card__title">{t("resumeEditor.selectionBasedWordingOptions")}</h3>
            </div>
            <button
              className="secondary-button"
              onClick={() => {
                setActiveSidePanel("suggestions");
                setIsContextPanelOpen(true);
              }}
              type="button"
            >
              {t("resumeEditor.openFullPanel")}
            </button>
          </div>
          {rewriteSuggestionsMutation.isPending ? (
            <p className="resume-tailor-muted">{t("resumeEditor.generatingRewriteSuggestions")}</p>
          ) : rewriteSuggestionsMutation.data ? (
            <div className="stack-list">
              {rewriteSuggestionsMutation.data.suggestions.slice(0, 2).map((suggestion) => (
                <article className="page-card page-card--muted" key={suggestion.id}>
                  <p className="section-heading__eyebrow">
                    {suggestion.focusArea ?? (t("resumeEditor.rewriteSuggestion"))}
                  </p>
                  <p className="page-card__body resume-section__body--preserve">
                    {suggestion.suggestedText}
                  </p>
                  <div className="page-card__actions">
                    <button
                      className="secondary-button"
                      onClick={() => {
                        void handleApplyRewrite(suggestion.suggestedText);
                      }}
                      type="button"
                    >
                      {t("resumeEditor.applyRewrite")}
                    </button>
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
