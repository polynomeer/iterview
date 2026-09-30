import type { EditorControllerProps } from "../editorViewProps";

export function InlineSuggestionPreviews({ ctrl }: EditorControllerProps) {
  const {
    isKorean,
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
              <p className="section-heading__eyebrow">{isKorean ? "인라인 질문 제안" : "Inline question suggestions"}</p>
              <h3 className="page-card__title">{isKorean ? "선택 영역 기반 질문 문구" : "Selection-based prompts"}</h3>
            </div>
            <button
              className="secondary-button"
              onClick={() => {
                setActiveSidePanel("suggestions");
                setIsContextPanelOpen(true);
              }}
              type="button"
            >
              {isKorean ? "전체 패널 열기" : "Open full panel"}
            </button>
          </div>
          {questionSuggestionsMutation.isPending ? (
            <p className="resume-tailor-muted">{isKorean ? "질문 제안을 생성하는 중..." : "Generating question suggestions..."}</p>
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
                      {isKorean ? "카드 만들기" : "Create card"}
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
              <p className="section-heading__eyebrow">{isKorean ? "인라인 문장 개선 제안" : "Inline rewrite suggestions"}</p>
              <h3 className="page-card__title">{isKorean ? "선택 영역 기반 문구 옵션" : "Selection-based wording options"}</h3>
            </div>
            <button
              className="secondary-button"
              onClick={() => {
                setActiveSidePanel("suggestions");
                setIsContextPanelOpen(true);
              }}
              type="button"
            >
              {isKorean ? "전체 패널 열기" : "Open full panel"}
            </button>
          </div>
          {rewriteSuggestionsMutation.isPending ? (
            <p className="resume-tailor-muted">{isKorean ? "문장 개선 제안을 생성하는 중..." : "Generating rewrite suggestions..."}</p>
          ) : rewriteSuggestionsMutation.data ? (
            <div className="stack-list">
              {rewriteSuggestionsMutation.data.suggestions.slice(0, 2).map((suggestion) => (
                <article className="page-card page-card--muted" key={suggestion.id}>
                  <p className="section-heading__eyebrow">
                    {suggestion.focusArea ?? (isKorean ? "문장 개선 제안" : "Rewrite suggestion")}
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
                      {isKorean ? "문장 적용" : "Apply rewrite"}
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
