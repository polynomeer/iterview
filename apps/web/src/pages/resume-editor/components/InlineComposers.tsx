import type { EditorControllerProps } from "../editorViewProps";

export function InlineComposers({ ctrl }: EditorControllerProps) {
  const {
    isKorean,
    selectedBlock,
    effectiveSelectedText,
    currentSelectionAnchor,
    setActiveSidePanel,
    setIsContextPanelOpen,
    createCommentMutation,
    createQuestionCardMutation,
    inlineComposerMode,
    setInlineComposerMode,
    inlineCommentBody,
    setInlineCommentBody,
    inlineCardTitle,
    setInlineCardTitle,
    inlineCardText,
    setInlineCardText,
    submitInlineComment,
    submitInlineQuestionCard,
    editorPopoverPosition,
  } = ctrl;

  return (
    <>
      {inlineComposerMode === "comment" && editorPopoverPosition ? (
        <article
          aria-label={isKorean ? "인라인 댓글 팝오버" : "Inline comment popover"}
          className="resume-editor-inline-preview resume-editor-inline-composer resume-editor-inline-composer--floating"
          role="dialog"
          style={{
            left: `${editorPopoverPosition.left}px`,
            top: `${editorPopoverPosition.top}px`,
          }}
        >
          <div className="resume-editor-inline-composer__header">
            <div>
              <p className="section-heading__eyebrow">{isKorean ? "인라인 댓글" : "Inline comment"}</p>
              <h3 className="page-card__title">{isKorean ? "현재 선택 영역에 댓글 남기기" : "Comment on the current selection"}</h3>
            </div>
            <button
              aria-label={isKorean ? "인라인 댓글 닫기" : "Close inline comment"}
              className="secondary-button"
              onClick={() => setInlineComposerMode(null)}
              type="button"
            >
              {isKorean ? "닫기" : "Close"}
            </button>
          </div>
          {effectiveSelectedText ? (
            <p className="resume-editor-inline-composer__meta">
              {isKorean ? "선택 영역:" : "Selection:"} {effectiveSelectedText}
            </p>
          ) : null}
          <label className="form-field">
            <span className="form-field__label">{isKorean ? "댓글" : "Comment"}</span>
            <textarea
              aria-label={isKorean ? "인라인 댓글" : "Inline comment"}
              className="form-field__input form-input--textarea"
              onChange={(event) => setInlineCommentBody(event.target.value)}
              rows={3}
              value={inlineCommentBody}
            />
          </label>
          <div className="page-card__actions resume-editor-inline-composer__actions">
            <button
              className="primary-button"
              disabled={
                createCommentMutation.isPending ||
                (!selectedBlock && !currentSelectionAnchor) ||
                !inlineCommentBody.trim()
              }
              onClick={() => {
                void submitInlineComment();
              }}
              type="button"
            >
              {isKorean ? "인라인 댓글 저장" : "Save inline comment"}
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                setActiveSidePanel("comments");
                setIsContextPanelOpen(true);
              }}
              type="button"
            >
              {isKorean ? "전체 패널 열기" : "Open full panel"}
            </button>
          </div>
        </article>
      ) : null}
      {inlineComposerMode === "card" && editorPopoverPosition ? (
        <article
          aria-label={isKorean ? "인라인 질문 카드 팝오버" : "Inline question card popover"}
          className="resume-editor-inline-preview resume-editor-inline-composer resume-editor-inline-composer--floating"
          role="dialog"
          style={{
            left: `${editorPopoverPosition.left}px`,
            top: `${editorPopoverPosition.top}px`,
          }}
        >
          <div className="resume-editor-inline-composer__header">
            <div>
              <p className="section-heading__eyebrow">{isKorean ? "인라인 질문 카드" : "Inline question card"}</p>
              <h3 className="page-card__title">{isKorean ? "현재 선택 영역에서 질문 문구 만들기" : "Create a prompt from the current selection"}</h3>
            </div>
            <button
              aria-label={isKorean ? "인라인 질문 카드 닫기" : "Close inline question card"}
              className="secondary-button"
              onClick={() => setInlineComposerMode(null)}
              type="button"
            >
              {isKorean ? "닫기" : "Close"}
            </button>
          </div>
          {effectiveSelectedText ? (
            <p className="resume-editor-inline-composer__meta">
              {isKorean ? "선택 영역:" : "Selection:"} {effectiveSelectedText}
            </p>
          ) : null}
          <label className="form-field">
            <span className="form-field__label">{isKorean ? "제목" : "Title"}</span>
            <input
              aria-label={isKorean ? "인라인 질문 카드 제목" : "Inline question card title"}
              className="form-field__input"
              onChange={(event) => setInlineCardTitle(event.target.value)}
              value={inlineCardTitle}
            />
          </label>
          <label className="form-field">
            <span className="form-field__label">{isKorean ? "질문 본문" : "Question text"}</span>
            <textarea
              aria-label={isKorean ? "인라인 질문 카드 본문" : "Inline question card text"}
              className="form-field__input form-input--textarea"
              onChange={(event) => setInlineCardText(event.target.value)}
              rows={3}
              value={inlineCardText}
            />
          </label>
          <div className="page-card__actions resume-editor-inline-composer__actions">
            <button
              className="primary-button"
              disabled={
                createQuestionCardMutation.isPending ||
                (!selectedBlock && !currentSelectionAnchor) ||
                !inlineCardText.trim()
              }
              onClick={() => {
                void submitInlineQuestionCard();
              }}
              type="button"
            >
              {isKorean ? "인라인 카드 저장" : "Save inline card"}
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                setActiveSidePanel("question-cards");
                setIsContextPanelOpen(true);
              }}
              type="button"
            >
              {isKorean ? "전체 패널 열기" : "Open full panel"}
            </button>
          </div>
        </article>
      ) : null}
    </>
  );
}
