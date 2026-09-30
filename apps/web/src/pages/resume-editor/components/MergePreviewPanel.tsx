import { MetricCard } from "../../../shared/ui/MetricCard";
import { mapEditableBlocks } from "../editorUtils";
import type { EditorViewProps } from "../editorViewProps";

export function MergePreviewPanel({ ctrl, workspace }: EditorViewProps) {
  const {
    isKorean,
    resolveConflictBlock,
    mergePreviewMutation,
    setBlocks,
    setMarkdownSource,
    mergePreviewMessage,
    saveCurrentDraft,
  } = ctrl;

  return (
    <section className="page-card">
      <span className="page-card__label">{isKorean ? "충돌 복구" : "Stale write recovery"}</span>
      <h2 className="page-card__title">{isKorean ? "병합 미리보기" : "Merge preview"}</h2>
      <p className="page-card__body">{mergePreviewMessage}</p>
      {mergePreviewMutation.data ? (
        <>
          <div className="stats-grid">
            <MetricCard label={isKorean ? "상태" : "Status"} value={mergePreviewMutation.data.mergeStatusLabel} />
            <MetricCard label={isKorean ? "추가" : "Added"} tone="accent" value={String(mergePreviewMutation.data.changeSummary.addedBlockCount)} />
            <MetricCard label={isKorean ? "수정" : "Updated"} tone="muted" value={String(mergePreviewMutation.data.changeSummary.updatedBlockCount)} />
            <MetricCard label={isKorean ? "충돌" : "Conflicts"} tone="muted" value={String(mergePreviewMutation.data.conflicts.length)} />
          </div>
          {mergePreviewMutation.data.conflicts.length > 0 ? (
            <div className="stack-list">
              {mergePreviewMutation.data.conflicts.map((conflict) => (
                <article className="page-card page-card--muted" key={conflict.id}>
                  <p className="section-heading__eyebrow">{conflict.conflictTypeLabel}</p>
                  <h3 className="page-card__title">{conflict.nodeId ?? conflict.blockId}</h3>
                  {conflict.conflictScopes.length > 0 ? (
                    <div className="filter-chip-row">
                      {conflict.conflictScopes.map((scope) => (
                        <span className="detail-chip" key={`${conflict.id}-${scope}`}>
                          {scope}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p className="resume-tailor-muted">{isKorean ? "서버 현재 버전" : "Server current"}</p>
                  <div className="page-card__body resume-section__body--preserve">
                    {(conflict.currentTextLines.length > 0
                      ? conflict.currentTextLines
                      : [conflict.currentText ?? (isKorean ? "텍스트 없음" : "No text")]
                    ).map((line, index) => (
                      <p key={`${conflict.id}-current-${index}`}>{line || "\u00A0"}</p>
                    ))}
                  </div>
                  <p className="resume-tailor-muted">{isKorean ? "내가 제안한 수정" : "Your proposed edit"}</p>
                  <div className="page-card__body resume-section__body--preserve">
                    {(conflict.proposedTextLines.length > 0
                      ? conflict.proposedTextLines
                      : [conflict.proposedText ?? (isKorean ? "텍스트 없음" : "No text")]
                    ).map((line, index) => (
                      <p key={`${conflict.id}-proposed-${index}`}>{line || "\u00A0"}</p>
                    ))}
                  </div>
                  <div className="page-card__actions">
                    <button
                      className="secondary-button"
                      onClick={() => resolveConflictBlock(conflict.blockId, "current")}
                      type="button"
                    >
                      {isKorean ? "서버 버전 유지" : "Keep server version"}
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => resolveConflictBlock(conflict.blockId, "proposed")}
                      type="button"
                    >
                      {isKorean ? "내 수정 유지" : "Keep my edit"}
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => resolveConflictBlock(conflict.blockId, "merged")}
                      type="button"
                    >
                      {isKorean ? "병합 텍스트 사용" : "Use merged text"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
          <div className="page-card__actions">
            <button
              className="primary-button"
              onClick={() => {
                if (!mergePreviewMutation.data) {
                  return;
                }

                setBlocks(mapEditableBlocks(mergePreviewMutation.data.mergedDocument.blocks));
                setMarkdownSource(mergePreviewMutation.data.mergedDocument.markdownSource);
              }}
              type="button"
            >
              {isKorean ? "병합된 초안을 작업공간에 적용" : "Apply merged draft to workspace"}
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                void saveCurrentDraft("merge_resolution");
              }}
              type="button"
            >
              {isKorean ? "해결된 초안 저장" : "Save resolved draft"}
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
