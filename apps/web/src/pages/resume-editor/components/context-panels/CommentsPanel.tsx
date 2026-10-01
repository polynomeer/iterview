import { Badge, Button, Card, CardHeader, EmptyState, Field, Input, Textarea } from "../../../../shared/ui/primitives";
import type { EditorViewProps } from "../../editorViewProps";

export function CommentsPanel({ ctrl, workspace }: EditorViewProps) {
  const {
    t,
    selectedBlock,
    effectiveSelectedText,
    currentSelectionAnchor,
    createCommentMutation,
    updateCommentMutation,
    createReplyMutation,
    newCommentBody,
    setNewCommentBody,
    replyDrafts,
    setReplyDrafts,
  } = ctrl;

  return (
    <Card padded>
      <CardHeader title={t("resumeEditor.commentThreads")} titleAs="h2" />
      <Field label={t("resumeEditor.newComment")}>
        {(control) => (
          <Textarea
            {...control}
            className="editor-textarea"
            onChange={(event) => setNewCommentBody(event.target.value)}
            rows={4}
            value={newCommentBody}
          />
        )}
      </Field>
      <div className="editor-actions">
        <Button
          disabled={
            (!selectedBlock && !currentSelectionAnchor) ||
            createCommentMutation.isPending ||
            !newCommentBody.trim()
          }
          onClick={() => {
            if (!selectedBlock && !currentSelectionAnchor) {
              return;
            }

            void createCommentMutation.mutateAsync({
              blockId: selectedBlock?.blockId ?? null,
              selectionAnchor: currentSelectionAnchor,
              fieldPath: currentSelectionAnchor?.fieldPath ?? selectedBlock?.fieldPath ?? null,
              selectionStartOffset: null,
              selectionEndOffset: null,
              selectedText: effectiveSelectedText,
              body: newCommentBody,
            });
            setNewCommentBody("");
          }}
          size="sm"
          variant="primary"
        >
          {t("resumeEditor.addComment")}
        </Button>
      </div>
      <div className="editor-stack">
        {workspace.comments.length === 0 ? (
          <EmptyState
            body={t("resumeEditor.noCommentThreadsYet")}
            title={t("resumeEditor.noComments")}
          />
        ) : (
          workspace.comments.map((comment) => (
            <article className="editor-item" key={comment.id}>
              <div className="editor-head">
                <Badge tone={comment.status === "resolved" ? "success" : "neutral"}>
                  {comment.statusLabel}
                </Badge>
                <Button
                  onClick={() => {
                    void updateCommentMutation.mutateAsync({
                      commentId: comment.id,
                      payload: {
                        status: comment.status === "resolved" ? "open" : "resolved",
                      },
                    });
                  }}
                  size="sm"
                >
                  {comment.status === "resolved"
                    ? t("resumeEditor.reopen")
                    : t("resumeEditor.resolve")}
                </Button>
              </div>
              {comment.selectedText ? (
                <p className="editor-inset editor-preserve">{comment.selectedText}</p>
              ) : null}
              <p className="editor-text editor-preserve">{comment.body}</p>
              {comment.replies.map((reply) => (
                <div className="editor-inset" key={reply.id}>
                  <p className="editor-label">{reply.createdAtLabel}</p>
                  <p className="editor-text editor-preserve">{reply.body}</p>
                </div>
              ))}
              <Field label={t("resumeEditor.reply")}>
                {(control) => (
                  <Input
                    {...control}
                    onChange={(event) =>
                      setReplyDrafts((current) => ({
                        ...current,
                        [comment.id]: event.target.value,
                      }))
                    }
                    value={replyDrafts[comment.id] ?? ""}
                  />
                )}
              </Field>
              <div className="editor-actions">
                <Button
                  disabled={!replyDrafts[comment.id]?.trim()}
                  onClick={() => {
                    void createReplyMutation.mutateAsync({
                      commentId: comment.id,
                      payload: {
                        body: replyDrafts[comment.id],
                      },
                    });
                    setReplyDrafts((current) => ({ ...current, [comment.id]: "" }));
                  }}
                  size="sm"
                >
                  {t("resumeEditor.addReply")}
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </Card>
  );
}
