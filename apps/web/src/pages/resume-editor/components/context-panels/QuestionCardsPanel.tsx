import { EmptyStateCard } from "../../../../shared/ui/EmptyStateCard";
import type { EditorViewProps } from "../../editorViewProps";

export function QuestionCardsPanel({ ctrl, workspace }: EditorViewProps) {
  const {
    isKorean,
    selectedBlock,
    effectiveSelectedText,
    currentSelectionAnchor,
    createQuestionCardMutation,
    updateQuestionCardMutation,
    newQuestionCardTitle,
    setNewQuestionCardTitle,
    newQuestionCardText,
    setNewQuestionCardText,
    newQuestionCardType,
    setNewQuestionCardType,
  } = ctrl;

  return (
    <section className="page-card">
      <span className="page-card__label">{isKorean ? "질문 카드" : "Question cards"}</span>
      <h2 className="page-card__title">{isKorean ? "면접 및 학습 질문 문구" : "Interview and study prompts"}</h2>
      <label className="form-field">
        <span className="form-field__label">{isKorean ? "제목" : "Title"}</span>
        <input
          className="form-field__input"
          onChange={(event) => setNewQuestionCardTitle(event.target.value)}
          value={newQuestionCardTitle}
        />
      </label>
      <label className="form-field">
        <span className="form-field__label">{isKorean ? "질문 본문" : "Question text"}</span>
        <textarea
          className="form-field__input form-input--textarea"
          onChange={(event) => setNewQuestionCardText(event.target.value)}
          rows={4}
          value={newQuestionCardText}
        />
      </label>
      <label className="form-field">
        <span className="form-field__label">{isKorean ? "질문 유형" : "Question type"}</span>
        <input
          className="form-field__input"
          onChange={(event) => setNewQuestionCardType(event.target.value)}
          value={newQuestionCardType}
        />
      </label>
      <div className="page-card__actions">
        <button
          className="primary-button"
          disabled={(!selectedBlock && !currentSelectionAnchor) || !newQuestionCardText.trim()}
          onClick={() => {
            if (!selectedBlock && !currentSelectionAnchor) {
              return;
            }

            void createQuestionCardMutation.mutateAsync({
              blockId: selectedBlock?.blockId ?? null,
              selectionAnchor: currentSelectionAnchor,
              fieldPath: currentSelectionAnchor?.fieldPath ?? selectedBlock?.fieldPath ?? null,
              selectionStartOffset: null,
              selectionEndOffset: null,
              selectedText: effectiveSelectedText,
              title: newQuestionCardTitle || null,
              questionText: newQuestionCardText,
              questionType: newQuestionCardType,
              linkedQuestionId: null,
              followUpSuggestions: [],
            });
            setNewQuestionCardTitle("");
            setNewQuestionCardText("");
          }}
          type="button"
        >
          {isKorean ? "질문 카드 만들기" : "Create question card"}
        </button>
      </div>
      <div className="stack-list">
        {workspace.questionCards.length === 0 ? (
          <EmptyStateCard
            body={isKorean ? "아직 질문 카드가 없습니다." : "No question cards yet."}
            title={isKorean ? "질문 카드 없음" : "No question cards"}
          />
        ) : (
          workspace.questionCards.map((card) => (
            <article className="page-card page-card--muted" key={card.id}>
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">{card.questionTypeLabel}</p>
                  <h3 className="page-card__title">{card.title}</h3>
                </div>
                <span className="question-status-badge question-status-badge--neutral">
                  {card.statusLabel}
                </span>
              </div>
              <p className="page-card__body resume-section__body--preserve">{card.questionText}</p>
              {card.followUpSuggestions.length > 0 ? (
                <div className="filter-chip-row">
                  {card.followUpSuggestions.map((item) => (
                    <span className="detail-chip" key={`${card.id}-${item}`}>
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="page-card__actions">
                <button
                  className="secondary-button"
                  onClick={() => {
                    void updateQuestionCardMutation.mutateAsync({
                      cardId: card.id,
                      payload: {
                        status: card.status === "archived" ? "active" : "archived",
                      },
                    });
                  }}
                  type="button"
                >
                  {card.status === "archived"
                    ? isKorean
                      ? "복원"
                      : "Restore"
                    : isKorean
                      ? "보관"
                      : "Archive"}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
