import { EmptyStateCard } from "../../../../shared/ui/EmptyStateCard";
import type { EditorControllerProps } from "../../editorViewProps";

export function SuggestionsPanel({ ctrl }: EditorControllerProps) {
  const {
    isKorean,
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
        <span className="page-card__label">{isKorean ? "제안" : "Suggestions"}</span>
        <h2 className="page-card__title">{isKorean ? "질문 및 문장 개선 제안" : "Question and rewrite suggestions"}</h2>
        <label className="form-field">
          <span className="form-field__label">{isKorean ? "최대 질문 제안 수" : "Max question suggestions"}</span>
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
            {isKorean ? "질문 제안 생성" : "Generate question suggestions"}
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
            {isKorean ? "문장 개선 제안 생성" : "Generate rewrite suggestions"}
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
                    {isKorean ? "제안으로 질문 카드 만들기" : "Create question card from suggestion"}
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
                <p className="section-heading__eyebrow">{suggestion.focusArea ?? (isKorean ? "문장 개선 제안" : "Rewrite suggestion")}</p>
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
                    {isKorean ? "초안에 문장 적용" : "Apply rewrite to draft"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    ) : (
      <EmptyStateCard
        body={isKorean ? "질문과 문장 개선 제안을 생성하려면 먼저 블록이나 문장을 선택하세요." : "Select a block or sentence first to generate question and rewrite suggestions."}
        title={isKorean ? "활성 선택 없음" : "No active selection"}
      />
    )
  );
}
