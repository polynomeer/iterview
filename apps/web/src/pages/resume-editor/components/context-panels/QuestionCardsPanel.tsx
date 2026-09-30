import { EmptyStateCard } from "../../../../shared/ui/EmptyStateCard";
import type { EditorViewProps } from "../../editorViewProps";

export function QuestionCardsPanel({ ctrl, workspace }: EditorViewProps) {
  const {
    t,
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
      <span className="page-card__label">{t("resumeEditor.questionCards")}</span>
      <h2 className="page-card__title">{t("resumeEditor.interviewAndStudyPrompts")}</h2>
      <label className="form-field">
        <span className="form-field__label">{t("resumeEditor.title")}</span>
        <input
          className="form-field__input"
          onChange={(event) => setNewQuestionCardTitle(event.target.value)}
          value={newQuestionCardTitle}
        />
      </label>
      <label className="form-field">
        <span className="form-field__label">{t("resumeEditor.questionText")}</span>
        <textarea
          className="form-field__input form-input--textarea"
          onChange={(event) => setNewQuestionCardText(event.target.value)}
          rows={4}
          value={newQuestionCardText}
        />
      </label>
      <label className="form-field">
        <span className="form-field__label">{t("resumeEditor.questionType")}</span>
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
          {t("resumeEditor.createQuestionCard")}
        </button>
      </div>
      <div className="stack-list">
        {workspace.questionCards.length === 0 ? (
          <EmptyStateCard
            body={t("resumeEditor.noQuestionCardsYet")}
            title={t("resumeEditor.noQuestionCards")}
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
                    ? t("resumeEditor.restore")
                    : t("resumeEditor.archive")}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
