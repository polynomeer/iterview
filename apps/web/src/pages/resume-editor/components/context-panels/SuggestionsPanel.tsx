import { Button, Card, CardHeader, EmptyState, Field, Input } from "../../../../shared/ui/primitives";
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
      <Card padded>
        <CardHeader title={t("resumeEditor.suggestions")} titleAs="h2" />
        <Field label={t("resumeEditor.maxQuestionSuggestions")}>
          {(control) => (
            <Input
              {...control}
              onChange={(event) => setQuestionSuggestionMax(event.target.value)}
              type="number"
              value={questionSuggestionMax}
            />
          )}
        </Field>
        <div className="editor-actions">
          <Button
            onClick={() => {
              void questionSuggestionsMutation.mutateAsync({
                blockId: selectedBlock?.blockId ?? null,
                selectionAnchor: currentSelectionAnchor,
                fieldPath: currentSelectionAnchor?.fieldPath ?? selectedBlock?.fieldPath ?? null,
                selectedText: effectiveSelectedText,
                maxSuggestions: Number(questionSuggestionMax) || 3,
              });
            }}
            size="sm"
          >
            {t("resumeEditor.generateQuestionSuggestions")}
          </Button>
          <Button
            onClick={() => {
              void rewriteSuggestionsMutation.mutateAsync({
                blockId: selectedBlock?.blockId ?? null,
                selectionAnchor: currentSelectionAnchor,
                fieldPath: currentSelectionAnchor?.fieldPath ?? selectedBlock?.fieldPath ?? null,
                selectedText: effectiveSelectedText,
              });
            }}
            size="sm"
          >
            {t("resumeEditor.generateRewriteSuggestions")}
          </Button>
        </div>
        {questionSuggestionsMutation.data ? (
          <div className="editor-stack">
            {questionSuggestionsMutation.data.suggestions.map((suggestion) => (
              <article className="editor-item" key={suggestion.id}>
                <p className="editor-label">{suggestion.questionTypeLabel}</p>
                <h3 className="editor-heading">{suggestion.title}</h3>
                <p className="editor-text editor-preserve">{suggestion.questionText}</p>
                <p className="editor-muted">{suggestion.rationale}</p>
                <div className="editor-actions">
                  <Button
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
                    size="sm"
                  >
                    {t("resumeEditor.createQuestionCardFromSuggestion")}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
        {rewriteSuggestionsMutation.data ? (
          <div className="editor-stack">
            {rewriteSuggestionsMutation.data.suggestions.map((suggestion) => (
              <article className="editor-item" key={suggestion.id}>
                <p className="editor-label">{suggestion.focusArea ?? (t("resumeEditor.rewriteSuggestion"))}</p>
                <p className="editor-text editor-preserve">{suggestion.suggestedText}</p>
                <p className="editor-muted">{suggestion.rationale}</p>
                <div className="editor-actions">
                  <Button
                    onClick={() => {
                      void handleApplyRewrite(suggestion.suggestedText);
                    }}
                    size="sm"
                  >
                    {t("resumeEditor.applyRewriteToDraft")}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </Card>
    ) : (
      <EmptyState
        body={t("resumeEditor.suggestionsNeedSelection")}
        title={t("resumeEditor.noActiveSelection")}
      />
    )
  );
}
