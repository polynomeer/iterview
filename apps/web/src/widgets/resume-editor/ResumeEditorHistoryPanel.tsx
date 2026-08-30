import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { useLocale } from "../../shared/i18n";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";

type RevisionItem = {
  id: string;
  revisionNo: number;
  changeSourceLabel: string;
  createdAtLabel: string;
  changeSummary: {
    addedBlockCount: number;
    updatedBlockCount: number;
    removedBlockCount: number;
    changedBlockIds: string[];
  };
};

type RevisionDetailBlock = {
  id: string;
  typeLabel: string;
  title: string;
  text: string;
};

type TrackedChange = {
  id: string;
  changeTypeLabel: string;
  nodeId: string | null;
  blockId: string | null;
  textChanged: boolean;
  structureChanged: boolean;
  moveRelated: boolean;
  beforeTextLines: string[] | null;
  beforeText: string | null;
  afterTextLines: string[] | null;
  afterText: string | null;
};

type Props = {
  revisionsLoading: boolean;
  revisionsError: boolean;
  revisionsErrorMessage: string;
  revisionsErrorDetails: string | null;
  onRetryRevisions: () => void;
  revisions: RevisionItem[];
  onSelectRevision: (revisionId: string) => void;
  selectedRevisionTitle: string;
  selectedRevisionCreatedAt: string | null;
  selectedRevisionSummary:
    | {
        addedBlockCount: number;
        updatedBlockCount: number;
      }
    | null;
  selectedRevisionBlocks: RevisionDetailBlock[];
  compareFromRevisionId: string | null;
  compareToRevisionId: string | null;
  onChangeCompareFrom: (revisionId: string) => void;
  onChangeCompareTo: (revisionId: string) => void;
  trackedChanges: TrackedChange[] | null;
};

export default function ResumeEditorHistoryPanel({
  revisionsLoading,
  revisionsError,
  revisionsErrorMessage,
  revisionsErrorDetails,
  onRetryRevisions,
  revisions,
  onSelectRevision,
  selectedRevisionTitle,
  selectedRevisionCreatedAt,
  selectedRevisionSummary,
  selectedRevisionBlocks,
  compareFromRevisionId,
  compareToRevisionId,
  onChangeCompareFrom,
  onChangeCompareTo,
  trackedChanges,
}: Props) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <div className="resume-editor-workspace">
      <div className="resume-editor-workspace__document">
        <section className="page-card">
          <span className="page-card__label">{isKorean ? "리비전" : "Revisions"}</span>
          <h2 className="page-card__title">{isKorean ? "리비전 기록" : "Revision history"}</h2>
          {revisionsLoading ? (
            <LoadingStateCard
              body={isKorean ? "저장된 작업공간 리비전을 불러오는 중입니다." : "Loading persisted workspace revisions."}
              title={isKorean ? "기록 준비 중" : "Preparing history"}
            />
          ) : revisionsError ? (
            <ErrorStateCard
              body={revisionsErrorMessage}
              details={revisionsErrorDetails ? [revisionsErrorDetails] : undefined}
              onAction={onRetryRevisions}
              title={isKorean ? "리비전을 불러올 수 없습니다" : "Unable to load revisions"}
            />
          ) : revisions.length > 0 ? (
            <div className="stack-list">
              {revisions.map((revision) => (
                <article className="page-card page-card--muted" key={revision.id}>
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">{revision.changeSourceLabel}</p>
                      <h3 className="page-card__title">{isKorean ? `리비전 ${revision.revisionNo}` : `Revision ${revision.revisionNo}`}</h3>
                    </div>
                    <button
                      className="secondary-button"
                      onClick={() => onSelectRevision(revision.id)}
                      type="button"
                    >
                      {isKorean ? "상세 보기" : "View detail"}
                    </button>
                  </div>
                  <p className="resume-tailor-muted">{revision.createdAtLabel}</p>
                  <div className="filter-chip-row">
                    <span className="detail-chip">{isKorean ? `추가 ${revision.changeSummary.addedBlockCount}` : `Added ${revision.changeSummary.addedBlockCount}`}</span>
                    <span className="detail-chip">{isKorean ? `수정 ${revision.changeSummary.updatedBlockCount}` : `Updated ${revision.changeSummary.updatedBlockCount}`}</span>
                    <span className="detail-chip">{isKorean ? `삭제 ${revision.changeSummary.removedBlockCount}` : `Removed ${revision.changeSummary.removedBlockCount}`}</span>
                    {revision.changeSummary.changedBlockIds.length > 0 ? (
                      <span className="detail-chip">
                        {isKorean
                          ? `변경된 id ${revision.changeSummary.changedBlockIds.length}`
                          : `Changed ids ${revision.changeSummary.changedBlockIds.length}`}
                      </span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyStateCard
              body={isKorean ? "현재 드래프트 외에는 아직 리비전 기록이 없습니다." : "No revision history beyond the current draft yet."}
              title={isKorean ? "리비전 없음" : "No revisions"}
            />
          )}
        </section>
      </div>
      <div className="resume-editor-workspace__side">
        <section className="page-card">
          <span className="page-card__label">{isKorean ? "리비전 상세" : "Revision detail"}</span>
          <h2 className="page-card__title">{selectedRevisionTitle}</h2>
          {selectedRevisionBlocks.length > 0 ? (
            <div className="page-stack">
              {selectedRevisionCreatedAt ? <p className="resume-tailor-muted">{selectedRevisionCreatedAt}</p> : null}
              {selectedRevisionSummary ? (
                <div className="filter-chip-row">
                  <span className="detail-chip">{isKorean ? `추가 ${selectedRevisionSummary.addedBlockCount}` : `Added ${selectedRevisionSummary.addedBlockCount}`}</span>
                  <span className="detail-chip">{isKorean ? `수정 ${selectedRevisionSummary.updatedBlockCount}` : `Updated ${selectedRevisionSummary.updatedBlockCount}`}</span>
                </div>
              ) : null}
              <div className="stack-list">
                {selectedRevisionBlocks.map((block) => (
                  <article className="page-card page-card--muted" key={block.id}>
                    <p className="section-heading__eyebrow">{block.typeLabel}</p>
                    <h3 className="page-card__title">{block.title}</h3>
                    <p className="page-card__body resume-section__body--preserve">{block.text}</p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="page-card">
          <span className="page-card__label">{isKorean ? "추적된 변경" : "Tracked changes"}</span>
          <h2 className="page-card__title">{isKorean ? "리비전 비교" : "Compare revisions"}</h2>
          <label className="form-field">
            <span className="form-field__label">{isKorean ? "기준 리비전" : "From revision"}</span>
            <select
              className="form-field__input"
              onChange={(event) => onChangeCompareFrom(event.target.value)}
              value={compareFromRevisionId ?? ""}
            >
              <option value="">{isKorean ? "리비전 선택" : "Select revision"}</option>
              {revisions.map((revision) => (
                <option key={`from-${revision.id}`} value={revision.id}>
                  {isKorean ? `리비전 ${revision.revisionNo}` : `Revision ${revision.revisionNo}`}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span className="form-field__label">{isKorean ? "비교 리비전" : "To revision"}</span>
            <select
              className="form-field__input"
              onChange={(event) => onChangeCompareTo(event.target.value)}
              value={compareToRevisionId ?? ""}
            >
              <option value="">{isKorean ? "리비전 선택" : "Select revision"}</option>
              {revisions.map((revision) => (
                <option key={`to-${revision.id}`} value={revision.id}>
                  {isKorean ? `리비전 ${revision.revisionNo}` : `Revision ${revision.revisionNo}`}
                </option>
              ))}
            </select>
          </label>
          {trackedChanges ? (
            <div className="stack-list">
              {trackedChanges.map((change) => (
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
                        {((change.beforeTextLines?.length ?? 0) > 0
                          ? change.beforeTextLines ?? []
                          : [change.beforeText ?? (isKorean ? "이전 텍스트 없음" : "No previous text")]
                        ).map((line, index) => (
                          <p key={`${change.id}-before-${index}`}>{line || "\u00A0"}</p>
                        ))}
                      </div>
                    </div>
                    <div className="resume-editor-diff-card__column">
                      <p className="resume-tailor-muted">{isKorean ? "이후" : "After"}</p>
                      <div className="page-card__body resume-section__body--preserve resume-editor-diff-card__surface resume-editor-diff-card__surface--after">
                        {((change.afterTextLines?.length ?? 0) > 0
                          ? change.afterTextLines ?? []
                          : [change.afterText ?? (isKorean ? "다음 텍스트 없음" : "No next text")]
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
