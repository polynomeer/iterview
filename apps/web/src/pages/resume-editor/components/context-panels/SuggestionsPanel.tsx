import { EmptyStateCard } from "../../../../shared/ui/EmptyStateCard";
import type { EditorControllerProps } from "../../editorViewProps";

export function SuggestionsPanel({ ctrl }: EditorControllerProps) {
  const {
    t,
    selectedBlock,
    effectiveSelectedText,
    currentSelectionAnchor,
    createQuestionCardMutation,
    questionSuggestionsMutation,
    rewriteSuggestionsMutation,
    questionSuggestionMax,
    setQuestionSuggestionMax,
    handleApplyRewrite,
  } = ctrl;

  return (
    selectedBlock || currentSelectionAnchor ? (
      <section className="page-card">
        <span className="page-card__label">{t("resumeEditor.suggestions")}</span>
        <h2 className="page-card__title">{t("resumeEditor.questionAndRewriteSuggestions")}</h2>
        <label className="form-field">
          <span className="form-field__label">{t("resumeEditor.maxQuestionSuggestions")}</span>
          <input
            className="form-field__input"
            onChange={(event) => setQuestionSuggestionMax(event.target.value)}
            type="number"
            value={questionSuggestionMax}
          />
        </label>
        <div className="page-card__actions">
          <button
            className="secondary-button"
            onClick={() => {
              void questionSuggestionsMutation.mutateAsync({
                blockId: selectedBlock?.blockId ?? null,
                selectionAnchor: currentSelectionAnchor,
                fieldPath: currentSelectionAnchor?.fieldPath ?? selectedBlock?.fieldPath ?? null,
                selectedText: effectiveSelectedText,
                maxSuggestions: Number(questionSuggestionMax) || 3,
              });
            }}
            type="button"
          >
            {t("resumeEditor.generateQuestionSuggestions")}
          </button>
          <button
            className="secondary-button"
            onClick={() => {
              void rewriteSuggestionsMutation.mutateAsync({
                blockId: selectedBlock?.blockId ?? null,
                selectionAnchor: currentSelectionAnchor,
                fieldPath: currentSelectionAnchor?.fieldPath ?? selectedBlock?.fieldPath ?? null,
                selectedText: effectiveSelectedText,
              });
            }}
            type="button"
          >
            {t("resumeEditor.generateRewriteSuggestions")}
          </button>
        </div>
        {questionSuggestionsMutation.data ? (
          <div className="stack-list">
            {questionSuggestionsMutation.data.suggestions.map((suggestion) => (
              <article className="page-card page-card--muted" key={suggestion.id}>
                <p className="section-heading__eyebrow">{suggestion.questionTypeLabel}</p>
                <h3 className="page-card__title">{suggestion.title}</h3>
                <p className="page-card__body resume-section__body--preserve">{suggestion.questionText}</p>
                <p className="resume-tailor-muted">{suggestion.rationale}</p>
                <div className="page-card__actions">
                  <button
                    className="secondary-button"
                    onClick={() => {
                      void createQuestionCardMutation.mutateAsync({
                        blockId: selectedBlock?.blockId ?? null,
                        selectionAnchor:
                          questionSuggestionsMutation.data?.selectionAnchor ?? currentSelectionAnchor,
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
                    {t("resumeEditor.createQuestionCardFromSuggestion")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
        {rewriteSuggestionsMutation.data ? (
          <div className="stack-list">
            {rewriteSuggestionsMutation.data.suggestions.map((suggestion) => (
              <article className="page-card page-card--muted" key={suggestion.id}>
                <p className="section-heading__eyebrow">{suggestion.focusArea ?? (t("resumeEditor.rewriteSuggestion"))}</p>
                <p className="page-card__body resume-section__body--preserve">{suggestion.suggestedText}</p>
                <p className="resume-tailor-muted">{suggestion.rationale}</p>
                <div className="page-card__actions">
                  <button
                    className="secondary-button"
                    onClick={() => {
                      void handleApplyRewrite(suggestion.suggestedText);
                    }}
                    type="button"
                  >
                    {t("resumeEditor.applyRewriteToDraft")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    ) : (
      <EmptyStateCard
        body={t("resumeEditor.suggestionsNeedSelection")}
        title={t("resumeEditor.noActiveSelection")}
      />
    )
  );
}
