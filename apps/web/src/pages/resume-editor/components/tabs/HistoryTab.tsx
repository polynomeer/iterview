import { getErrorDetails, userFacingErrorMessage } from "../../../../shared/api/errors";
import { EmptyStateCard } from "../../../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../../../shared/ui/LoadingStateCard";
import type { EditorControllerProps } from "../../editorViewProps";

export function HistoryTab({ ctrl }: EditorControllerProps) {
  const {
    isKorean,
    revisionsQuery,
    setSelectedRevisionId,
    compareFromRevisionId,
    setCompareFromRevisionId,
    compareToRevisionId,
    setCompareToRevisionId,
    revisionDetailQuery,
    trackedChangesQuery,
  } = ctrl;

  return (
    <div className="resume-editor-workspace">
      <div className="resume-editor-workspace__document">
        <section className="page-card">
          <span className="page-card__label">{isKorean ? "리비전" : "Revisions"}</span>
          <h2 className="page-card__title">{isKorean ? "리비전 히스토리" : "Revision history"}</h2>
          {revisionsQuery.isLoading ? (
            <LoadingStateCard
              body={isKorean ? "저장된 작업공간 리비전을 불러오는 중입니다." : "Loading persisted workspace revisions."}
              title={isKorean ? "히스토리 준비 중" : "Preparing history"}
            />
          ) : revisionsQuery.isError ? (
            <ErrorStateCard
              body={userFacingErrorMessage(revisionsQuery.error, isKorean ? "리비전을 불러올 수 없습니다." : "Unable to load revisions.")}
              details={getErrorDetails(revisionsQuery.error)}
              onAction={() => {
                void revisionsQuery.refetch();
              }}
              title={isKorean ? "리비전을 불러올 수 없습니다" : "Unable to load revisions"}
            />
          ) : revisionsQuery.data && revisionsQuery.data.length > 0 ? (
            <div className="stack-list">
              {revisionsQuery.data.map((revision) => (
                <article className="page-card page-card--muted" key={revision.id}>
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">{revision.changeSourceLabel}</p>
                      <h3 className="page-card__title">{isKorean ? `리비전 ${revision.revisionNo}` : `Revision ${revision.revisionNo}`}</h3>
                    </div>
                    <button
                      className="secondary-button"
                      onClick={() => setSelectedRevisionId(revision.id)}
                      type="button"
                    >
                      {isKorean ? "상세 보기" : "View detail"}
                    </button>
                  </div>
                  <p className="resume-tailor-muted">{revision.createdAtLabel}</p>
              <div className="filter-chip-row">
                <span className="detail-chip">{isKorean ? "추가" : "Added"} {revision.changeSummary.addedBlockCount}</span>
                <span className="detail-chip">{isKorean ? "수정" : "Updated"} {revision.changeSummary.updatedBlockCount}</span>
                <span className="detail-chip">{isKorean ? "삭제" : "Removed"} {revision.changeSummary.removedBlockCount}</span>
                {revision.changeSummary.changedBlockIds.length > 0 ? (
                  <span className="detail-chip">
                    {isKorean ? "변경 ID" : "Changed ids"} {revision.changeSummary.changedBlockIds.length}
                  </span>
                ) : null}
              </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyStateCard
              body={isKorean ? "현재 초안을 제외하면 아직 리비전 히스토리가 없습니다." : "No revision history beyond the current draft yet."}
              title={isKorean ? "리비전 없음" : "No revisions"}
            />
          )}
        </section>
      </div>
      <div className="resume-editor-workspace__side">
        <section className="page-card">
          <span className="page-card__label">{isKorean ? "리비전 상세" : "Revision detail"}</span>
          <h2 className="page-card__title">
            {revisionDetailQuery.data
              ? isKorean
                ? `리비전 ${revisionDetailQuery.data.revisionNo}`
                : `Revision ${revisionDetailQuery.data.revisionNo}`
              : isKorean
                ? "리비전을 선택하세요"
                : "Select a revision"}
          </h2>
          {revisionDetailQuery.data ? (
            <div className="page-stack">
              <p className="resume-tailor-muted">{revisionDetailQuery.data.createdAtLabel}</p>
              <div className="filter-chip-row">
                <span className="detail-chip">{isKorean ? "추가" : "Added"} {revisionDetailQuery.data.changeSummary.addedBlockCount}</span>
                <span className="detail-chip">{isKorean ? "수정" : "Updated"} {revisionDetailQuery.data.changeSummary.updatedBlockCount}</span>
              </div>
              <div className="stack-list">
                {(revisionDetailQuery.data.document.nodes.length > 0
                  ? revisionDetailQuery.data.document.nodes
                  : revisionDetailQuery.data.document.blocks
                ).map((block) => (
                  <article
                    className="page-card page-card--muted"
                    key={"nodeId" in block ? block.nodeId : block.blockId}
                  >
                    <p className="section-heading__eyebrow">
                      {"nodeId" in block ? block.nodeTypeLabel : block.blockTypeLabel}
                    </p>
                    <h3 className="page-card__title">
                      {"nodeId" in block
                        ? block.metadata.heading ?? block.fieldPath ?? block.nodeId
                        : block.title || block.blockId}
                    </h3>
                    <p className="page-card__body resume-section__body--preserve">
                      {"nodeId" in block ? block.text : block.textValue}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="page-card">
          <span className="page-card__label">{isKorean ? "변경 추적" : "Tracked changes"}</span>
          <h2 className="page-card__title">{isKorean ? "리비전 비교" : "Compare revisions"}</h2>
          <label className="form-field">
            <span className="form-field__label">{isKorean ? "기준 리비전" : "From revision"}</span>
            <select
              className="form-field__input"
              onChange={(event) => setCompareFromRevisionId(event.target.value)}
              value={compareFromRevisionId ?? ""}
            >
              <option value="">{isKorean ? "리비전 선택" : "Select revision"}</option>
              {revisionsQuery.data?.map((revision) => (
                <option key={`from-${revision.id}`} value={revision.id}>
                  {isKorean ? `리비전 ${revision.revisionNo}` : `Revision ${revision.revisionNo}`}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span className="form-field__label">{isKorean ? "대상 리비전" : "To revision"}</span>
            <select
              className="form-field__input"
              onChange={(event) => setCompareToRevisionId(event.target.value)}
              value={compareToRevisionId ?? ""}
            >
              <option value="">{isKorean ? "리비전 선택" : "Select revision"}</option>
              {revisionsQuery.data?.map((revision) => (
                <option key={`to-${revision.id}`} value={revision.id}>
                  {isKorean ? `리비전 ${revision.revisionNo}` : `Revision ${revision.revisionNo}`}
                </option>
              ))}
            </select>
          </label>
          {trackedChangesQuery.data ? (
            <div className="stack-list">
              {trackedChangesQuery.data.changes.map((change) => (
                <article className="page-card page-card--muted resume-editor-diff-card" key={change.id}>
                  <p className="section-heading__eyebrow">{change.changeTypeLabel}</p>
                  <h3 className="page-card__title">{change.nodeId ?? change.blockId}</h3>
                  <div className="filter-chip-row">
                    {change.textChanged ? <span className="detail-chip">{isKorean ? "텍스트 변경" : "Text changed"}</span> : null}
                    {change.structureChanged ? <span className="detail-chip">{isKorean ? "구조 변경" : "Structure changed"}</span> : null}
                    {change.moveRelated ? <span className="detail-chip">{isKorean ? "이동 관련" : "Move related"}</span> : null}
                  </div>
                  <div className="resume-editor-diff-card__grid">
                    <div className="resume-editor-diff-card__column">
                      <p className="resume-tailor-muted">{isKorean ? "이전" : "Before"}</p>
                      <div className="page-card__body resume-section__body--preserve resume-editor-diff-card__surface resume-editor-diff-card__surface--before">
                        {(change.beforeTextLines.length > 0
                          ? change.beforeTextLines
                          : [change.beforeText ?? (isKorean ? "이전 텍스트 없음" : "No previous text")]
                        ).map((line, index) => (
                          <p key={`${change.id}-before-${index}`}>{line || "\u00A0"}</p>
                        ))}
                      </div>
                    </div>
                    <div className="resume-editor-diff-card__column">
                      <p className="resume-tailor-muted">{isKorean ? "이후" : "After"}</p>
                      <div className="page-card__body resume-section__body--preserve resume-editor-diff-card__surface resume-editor-diff-card__surface--after">
                        {(change.afterTextLines.length > 0
                          ? change.afterTextLines
                          : [change.afterText ?? (isKorean ? "수정된 텍스트 없음" : "No updated text")]
                        ).map((line, index) => (
                          <p key={`${change.id}-after-${index}`}>{line || "\u00A0"}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
