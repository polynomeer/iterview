import { EmptyStateCard } from "../../../../shared/ui/EmptyStateCard";
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
    <section className="page-card">
      <span className="page-card__label">{t("resumeEditor.comments")}</span>
      <h2 className="page-card__title">{t("resumeEditor.commentThreads")}</h2>
      <label className="form-field">
        <span className="form-field__label">{t("resumeEditor.newComment")}</span>
        <textarea
          className="form-field__input form-input--textarea"
          onChange={(event) => setNewCommentBody(event.target.value)}
          rows={4}
          value={newCommentBody}
        />
      </label>
      <div className="page-card__actions">
        <button
          className="primary-button"
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
          type="button"
        >
          {t("resumeEditor.addComment")}
        </button>
      </div>
      <div className="stack-list">
        {workspace.comments.length === 0 ? (
          <EmptyStateCard
            body={t("resumeEditor.noCommentThreadsYet")}
            title={t("resumeEditor.noComments")}
          />
        ) : (
          workspace.comments.map((comment) => (
            <article className="page-card page-card--muted" key={comment.id}>
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">{comment.statusLabel}</p>
                  <h3 className="page-card__title">{comment.selectedText ?? comment.blockId}</h3>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => {
                    void updateCommentMutation.mutateAsync({
                      commentId: comment.id,
                      payload: {
                        status: comment.status === "resolved" ? "open" : "resolved",
                      },
                    });
                  }}
                  type="button"
                >
                  {comment.status === "resolved"
                    ? t("resumeEditor.reopen")
                    : t("resumeEditor.resolve")}
                </button>
              </div>
              <p className="page-card__body resume-section__body--preserve">{comment.body}</p>
              {comment.replies.map((reply) => (
                <div className="resume-tailor-compare-block" key={reply.id}>
                  <p className="resume-tailor-muted">{reply.createdAtLabel}</p>
                  <p className="page-card__body resume-section__body--preserve">{reply.body}</p>
                </div>
              ))}
              <label className="form-field">
                <span className="form-field__label">{t("resumeEditor.reply")}</span>
                <input
                  className="form-field__input"
                  onChange={(event) =>
                    setReplyDrafts((current) => ({
                      ...current,
                      [comment.id]: event.target.value,
                    }))
                  }
                  value={replyDrafts[comment.id] ?? ""}
                />
              </label>
              <div className="page-card__actions">
                <button
                  className="secondary-button"
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
                  type="button"
                >
                  {t("resumeEditor.addReply")}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
