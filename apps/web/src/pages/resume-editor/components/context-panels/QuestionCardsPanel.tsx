import { Badge, Button, Card, CardHeader, EmptyState, Field, Input, Textarea } from "../../../../shared/ui/primitives";
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
    <Card padded>
      <CardHeader title={t("resumeEditor.questionCards")} titleAs="h2" />
      <Field label={t("resumeEditor.title")}>
        {(control) => (
          <Input
            {...control}
            onChange={(event) => setNewQuestionCardTitle(event.target.value)}
            value={newQuestionCardTitle}
          />
        )}
      </Field>
      <Field label={t("resumeEditor.questionText")}>
        {(control) => (
          <Textarea
            {...control}
            className="editor-textarea"
            onChange={(event) => setNewQuestionCardText(event.target.value)}
            rows={4}
            value={newQuestionCardText}
          />
        )}
      </Field>
      <Field label={t("resumeEditor.questionType")}>
        {(control) => (
          <Input
            {...control}
            onChange={(event) => setNewQuestionCardType(event.target.value)}
            value={newQuestionCardType}
          />
        )}
      </Field>
      <div className="editor-actions">
        <Button
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
          size="sm"
          variant="primary"
        >
          {t("resumeEditor.createQuestionCard")}
        </Button>
      </div>
      <div className="editor-stack">
        {workspace.questionCards.length === 0 ? (
          <EmptyState
            body={t("resumeEditor.noQuestionCardsYet")}
            title={t("resumeEditor.noQuestionCards")}
          />
        ) : (
          workspace.questionCards.map((card) => (
            <article className="editor-item" key={card.id}>
              <div className="editor-head">
                <div>
                  <p className="editor-label">{card.questionTypeLabel}</p>
                  <h3 className="editor-heading">{card.title}</h3>
                </div>
                <Badge>{card.statusLabel}</Badge>
              </div>
              <p className="editor-text editor-preserve">{card.questionText}</p>
              {card.followUpSuggestions.length > 0 ? (
                <div className="editor-chips">
                  {card.followUpSuggestions.map((item) => (
                    <Badge key={`${card.id}-${item}`}>{item}</Badge>
                  ))}
                </div>
              ) : null}
              <div className="editor-actions">
                <Button
                  onClick={() => {
                    void updateQuestionCardMutation.mutateAsync({
                      cardId: card.id,
                      payload: {
                        status: card.status === "archived" ? "active" : "archived",
                      },
                    });
                  }}
                  size="sm"
                >
                  {card.status === "archived"
                    ? t("resumeEditor.restore")
                    : t("resumeEditor.archive")}
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </Card>
  );
}
