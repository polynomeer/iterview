import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
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
  return (
    <div className="resume-editor-workspace">
      <div className="resume-editor-workspace__document">
        <section className="page-card">
          <span className="page-card__label">Revisions</span>
          <h2 className="page-card__title">Revision history</h2>
          {revisionsLoading ? (
            <LoadingStateCard body="Loading persisted workspace revisions." title="Preparing history" />
          ) : revisionsError ? (
            <ErrorStateCard
              body={revisionsErrorMessage}
              details={revisionsErrorDetails ? [revisionsErrorDetails] : undefined}
              onAction={onRetryRevisions}
              title="Unable to load revisions"
            />
          ) : revisions.length > 0 ? (
            <div className="stack-list">
              {revisions.map((revision) => (
                <article className="page-card page-card--muted" key={revision.id}>
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">{revision.changeSourceLabel}</p>
                      <h3 className="page-card__title">Revision {revision.revisionNo}</h3>
                    </div>
                    <button
                      className="secondary-button"
                      onClick={() => onSelectRevision(revision.id)}
                      type="button"
                    >
                      View detail
                    </button>
                  </div>
                  <p className="resume-tailor-muted">{revision.createdAtLabel}</p>
                  <div className="filter-chip-row">
                    <span className="detail-chip">Added {revision.changeSummary.addedBlockCount}</span>
                    <span className="detail-chip">Updated {revision.changeSummary.updatedBlockCount}</span>
                    <span className="detail-chip">Removed {revision.changeSummary.removedBlockCount}</span>
                    {revision.changeSummary.changedBlockIds.length > 0 ? (
                      <span className="detail-chip">
                        Changed ids {revision.changeSummary.changedBlockIds.length}
                      </span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyStateCard body="No revision history beyond the current draft yet." title="No revisions" />
          )}
        </section>
      </div>
      <div className="resume-editor-workspace__side">
        <section className="page-card">
          <span className="page-card__label">Revision detail</span>
          <h2 className="page-card__title">{selectedRevisionTitle}</h2>
          {selectedRevisionBlocks.length > 0 ? (
            <div className="page-stack">
              {selectedRevisionCreatedAt ? <p className="resume-tailor-muted">{selectedRevisionCreatedAt}</p> : null}
              {selectedRevisionSummary ? (
                <div className="filter-chip-row">
                  <span className="detail-chip">Added {selectedRevisionSummary.addedBlockCount}</span>
                  <span className="detail-chip">Updated {selectedRevisionSummary.updatedBlockCount}</span>
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
          <span className="page-card__label">Tracked changes</span>
          <h2 className="page-card__title">Compare revisions</h2>
          <label className="form-field">
            <span className="form-field__label">From revision</span>
            <select
              className="form-field__input"
              onChange={(event) => onChangeCompareFrom(event.target.value)}
              value={compareFromRevisionId ?? ""}
            >
              <option value="">Select revision</option>
              {revisions.map((revision) => (
                <option key={`from-${revision.id}`} value={revision.id}>
                  Revision {revision.revisionNo}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span className="form-field__label">To revision</span>
            <select
              className="form-field__input"
              onChange={(event) => onChangeCompareTo(event.target.value)}
              value={compareToRevisionId ?? ""}
            >
              <option value="">Select revision</option>
              {revisions.map((revision) => (
                <option key={`to-${revision.id}`} value={revision.id}>
                  Revision {revision.revisionNo}
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
                    {change.textChanged ? <span className="detail-chip">Text changed</span> : null}
                    {change.structureChanged ? <span className="detail-chip">Structure changed</span> : null}
                    {change.moveRelated ? <span className="detail-chip">Move related</span> : null}
                  </div>
                  <div className="resume-editor-diff-card__grid">
                    <div className="resume-editor-diff-card__column">
                      <p className="resume-tailor-muted">Before</p>
                      <div className="page-card__body resume-section__body--preserve resume-editor-diff-card__surface resume-editor-diff-card__surface--before">
                        {((change.beforeTextLines?.length ?? 0) > 0
                          ? change.beforeTextLines ?? []
                          : [change.beforeText ?? "No previous text"]
                        ).map((line, index) => (
                          <p key={`${change.id}-before-${index}`}>{line || "\u00A0"}</p>
                        ))}
                      </div>
                    </div>
                    <div className="resume-editor-diff-card__column">
                      <p className="resume-tailor-muted">After</p>
                      <div className="page-card__body resume-section__body--preserve resume-editor-diff-card__surface resume-editor-diff-card__surface--after">
                        {((change.afterTextLines?.length ?? 0) > 0
                          ? change.afterTextLines ?? []
                          : [change.afterText ?? "No next text"]
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
