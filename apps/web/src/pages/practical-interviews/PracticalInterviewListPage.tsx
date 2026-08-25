import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getResumeVersionChoices } from "../../entities/resume/model";
import { useCreateInterviewRecordMutation } from "../../features/practical-interview/api/useCreateInterviewRecordMutation";
import { useInterviewRecordListQuery } from "../../features/practical-interview/api/useInterviewRecordListQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { SectionPanel } from "../../shared/ui/layout";

export function PracticalInterviewListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewType, setInterviewType] = useState("onsite");
  const [transcriptText, setTranscriptText] = useState("");
  const [selectedResumeVersionId, setSelectedResumeVersionId] = useState<string>("");
  const [uploadOpen, setUploadOpen] = useState(location.pathname.endsWith("/upload"));
  const recordListQuery = useInterviewRecordListQuery();
  const resumeListQuery = useResumeListQuery();
  const createRecordMutation = useCreateInterviewRecordMutation();
  const resumeChoices = useMemo(
    () => getResumeVersionChoices(resumeListQuery.data),
    [resumeListQuery.data],
  );
  const importedRecordCount = recordListQuery.data?.length ?? 0;
  const processingRecordCount =
    recordListQuery.data?.filter(
      (record) =>
        record.transcriptStatus === "pending" || record.transcriptStatus === "processing",
    ).length ?? 0;
  const retryRecordCount =
    recordListQuery.data?.filter((record) => record.transcriptRetryCount > 0).length ?? 0;
  const readyReviewCount =
    recordListQuery.data?.filter(
      (record) =>
        record.transcriptStatus === "completed" || record.analysisStatus === "completed",
    ).length ?? 0;

  useEffect(() => {
    if (!selectedResumeVersionId && resumeChoices.length > 0) {
      setSelectedResumeVersionId(
        resumeChoices.find((choice) => choice.isActive)?.versionId ?? resumeChoices[0].versionId,
      );
    }
  }, [resumeChoices, selectedResumeVersionId]);

  async function handleCreateRecord() {
    if (!file) {
      return;
    }

    const payload = new FormData();
    payload.set("file", file);

    if (companyName.trim()) {
      payload.set("companyName", companyName.trim());
    }

    if (roleName.trim()) {
      payload.set("roleName", roleName.trim());
    }

    if (interviewDate) {
      payload.set("interviewDate", interviewDate);
    }

    if (interviewType) {
      payload.set("interviewType", interviewType);
    }

    if (selectedResumeVersionId) {
      payload.set("linkedResumeVersionId", selectedResumeVersionId);
    }

    if (transcriptText.trim()) {
      payload.set("transcriptText", transcriptText.trim());
    }

    const created = await createRecordMutation.mutateAsync(payload);
    const nextPath = routeConfig.practicalInterviewDetail.buildPath({ recordId: created.id });
    const nextSearch =
      created.isTranscriptPending || created.isTranscriptProcessing ? "?processing=1" : "";

    navigate(`${nextPath}${nextSearch}`);
  }

  return (
    <PageContainer
      description="Import one real interview artifact, stabilize transcript readiness, and turn it into the next recovery review workspace."
      eyebrow="Recovery loop"
      title="Import real interview evidence before opening recovery review"
    >
      {recordListQuery.isLoading ? (
        <LoadingStateCard
          body="Loading imported interview records and preparing the upload workspace."
          title="Preparing practical interviews"
        />
      ) : null}

      {recordListQuery.isError ? (
        <ErrorStateCard
          body={
            recordListQuery.error instanceof Error
              ? recordListQuery.error.message
              : "The practical interview records could not be loaded."
          }
          details={getErrorDetails(recordListQuery.error)}
          onAction={() => {
            void recordListQuery.refetch();
          }}
          title="Unable to load practical interviews"
        />
      ) : null}

      {!recordListQuery.isLoading && !recordListQuery.isError ? (
        <div className="practical-list-layout">
          <section className="practical-list-workspace-surface">
            <div className="practical-list-workspace-surface__header">
              <div className="practical-list-workspace-surface__intro">
                <div className="practical-list-workspace-surface__eyebrow-row">
                  <p className="practical-list-workspace-surface__breadcrumbs">
                    <span>Imported interview</span>
                    <span>/</span>
                    <span>Transcript readiness</span>
                    <span>/</span>
                    <span>Recovery review</span>
                  </p>
                  <span className="question-status-badge question-status-badge--neutral">
                    Replay-ready workflow
                  </span>
                </div>
                <h2 className="practical-list-workspace-surface__title">
                  Import one real interview and route it into one focused recovery loop
                </h2>
                <p className="practical-list-workspace-surface__body">
                  Each upload should become a structured review workspace with transcript quality,
                  linked resume context, and follow-up replay paths already visible before deep
                  analysis starts.
                </p>
              </div>
              <div className="practical-list-workspace-surface__stats">
                <article className="practical-list-workspace-surface__stat">
                  <span>Imported records</span>
                  <strong>{importedRecordCount}</strong>
                </article>
                <article className="practical-list-workspace-surface__stat">
                  <span>Ready for review</span>
                  <strong>{readyReviewCount}</strong>
                </article>
                <article className="practical-list-workspace-surface__stat">
                  <span>Processing now</span>
                  <strong>{processingRecordCount}</strong>
                </article>
                <article className="practical-list-workspace-surface__stat">
                  <span>Resume versions</span>
                  <strong>{resumeChoices.length}</strong>
                </article>
              </div>
            </div>
            <div className="practical-list-workspace-surface__chips">
              <span className="detail-chip">
                Upload state: {file ? file.name : "No file selected"}
              </span>
              <span className="detail-chip">
                Retry queue: {retryRecordCount} record{retryRecordCount === 1 ? "" : "s"}
              </span>
              <span className="detail-chip">
                Next action: {uploadOpen ? "complete import form" : "open upload or continue review"}
              </span>
            </div>
            <div className="practical-list-workspace-surface__guidance">
              <article className="practical-list-workspace-surface__guidance-card">
                <span>Import rule</span>
                <strong>Bring one interview in with explicit company, role, and transcript context so review does not start from an ambiguous artifact.</strong>
              </article>
              <article className="practical-list-workspace-surface__guidance-card">
                <span>Recovery priority</span>
                <strong>
                  {processingRecordCount > 0
                    ? "Finish transcript-ready records first, then clean up retries before importing more."
                    : "Open the freshest completed record first and turn it into a focused recovery review."}
                </strong>
              </article>
              <article className="practical-list-workspace-surface__guidance-card">
                <span>Exit rule</span>
                <strong>Leave this page once one record is clearly ready to inspect transcript, question, and thread failures.</strong>
              </article>
            </div>
          </section>

          <div className="practical-list-priority-board">
            <section className="page-card practical-list-priority-board__main">
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">Import flow</p>
                  <h2 className="page-card__title">What this workspace is for</h2>
                </div>
              </div>
              <div className="practical-list-priority-board__steps">
                <article className="practical-list-priority-step">
                  <div className="practical-list-priority-step__index">1</div>
                  <div className="practical-list-priority-step__body">
                    <strong>Capture one interview artifact</strong>
                    <span>
                      Bring in audio and transcript context without losing company, role, and date.
                    </span>
                  </div>
                </article>
                <article className="practical-list-priority-step">
                  <div className="practical-list-priority-step__index">2</div>
                  <div className="practical-list-priority-step__body">
                    <strong>Link it to source-of-truth</strong>
                    <span>
                      Attach the correct resume version so later weakness analysis maps back to real
                      claims.
                    </span>
                  </div>
                </article>
                <article className="practical-list-priority-step">
                  <div className="practical-list-priority-step__index">3</div>
                  <div className="practical-list-priority-step__body">
                    <strong>Open one focused review surface</strong>
                    <span>
                      Move into transcript, question, and thread review without hunting across
                      routes.
                    </span>
                  </div>
                </article>
              </div>
            </section>

            <SectionPanel
              className="workspace-note-card workspace-note-card--accent practical-list-priority-board__side"
              variant="muted"
            >
              <span className="page-card__label">Coverage signals</span>
              <h2 className="page-card__title">Current queue health</h2>
              <div className="practical-list-signal-list">
                <div className="practical-list-signal-list__item">
                  <span>Processing</span>
                  <strong>{processingRecordCount} records are still waiting for transcript readiness.</strong>
                </div>
                <div className="practical-list-signal-list__item">
                  <span>Replay ready</span>
                  <strong>{readyReviewCount} records can already be opened as review workspaces.</strong>
                </div>
                <div className="practical-list-signal-list__item">
                  <span>Resume context</span>
                  <strong>
                    {resumeChoices.length > 0
                      ? "Resume-linked imports can feed heatmap and source-of-truth repair later."
                      : "No parsed resume version is ready yet, so imports will stay isolated."}
                  </strong>
                </div>
              </div>
            </SectionPanel>
          </div>

          <div className="practical-list-layout__workspace">
            <div className="page-stack practical-list-layout__main">
              {uploadOpen ? (
                <section className="page-card page-card--inset practical-import-form-card">
                  <span className="page-card__label">Upload</span>
                  <h2 className="page-card__title">Create an interview record</h2>
                  <p className="page-card__body">
                    Keep import metadata explicit now so the downstream review page can explain what
                    happened, where it came from, and which resume claims it should challenge.
                  </p>
                  <div className="practical-import-form-card__summary">
                    <span className="detail-chip">Audio required</span>
                    <span className="detail-chip">Resume link optional</span>
                    <span className="detail-chip">Transcript paste optional</span>
                  </div>
                  <div className="practical-import-form-card__guidance">
                    <article className="practical-import-form-card__guidance-item">
                      <span>Best use</span>
                      <strong>Import a single interview when you are ready to inspect weak answers, transcript quality, and resume alignment together.</strong>
                    </article>
                    <article className="practical-import-form-card__guidance-item">
                      <span>Before submit</span>
                      <strong>Choose the resume version that actually grounded that interview, otherwise later weakness analysis will drift from source of truth.</strong>
                    </article>
                  </div>
                  <div className="form-grid">
                    <label className="form-field">
                      <span className="form-field__label">Audio file</span>
                      <input
                        accept=".mp3,.m4a,.wav,.aac,.ogg,.webm"
                        className="form-input"
                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                        type="file"
                      />
                      <span className="form-field__hint">
                        Upload the interview audio. The server can extract a transcript
                        automatically if you do not paste one below.
                      </span>
                    </label>
                    <label className="form-field">
                      <span className="form-field__label">Company</span>
                      <input
                        className="form-input"
                        onChange={(event) => setCompanyName(event.target.value)}
                        type="text"
                        value={companyName}
                      />
                    </label>
                    <label className="form-field">
                      <span className="form-field__label">Role</span>
                      <input
                        className="form-input"
                        onChange={(event) => setRoleName(event.target.value)}
                        type="text"
                        value={roleName}
                      />
                    </label>
                    <label className="form-field">
                      <span className="form-field__label">Interview date</span>
                      <input
                        className="form-input"
                        onChange={(event) => setInterviewDate(event.target.value)}
                        type="date"
                        value={interviewDate}
                      />
                    </label>
                    <label className="form-field">
                      <span className="form-field__label">Interview type</span>
                      <select
                        className="form-input"
                        onChange={(event) => setInterviewType(event.target.value)}
                        value={interviewType}
                      >
                        <option value="onsite">Onsite</option>
                        <option value="phone">Phone</option>
                        <option value="virtual">Virtual</option>
                        <option value="behavioral">Behavioral</option>
                        <option value="system_design">System design</option>
                      </select>
                    </label>
                    <label className="form-field">
                      <span className="form-field__label">Linked resume version</span>
                      <select
                        className="form-input"
                        onChange={(event) => setSelectedResumeVersionId(event.target.value)}
                        value={selectedResumeVersionId}
                      >
                        <option value="">None</option>
                        {resumeChoices.map((choice) => (
                          <option key={choice.versionId} value={choice.versionId}>
                            {choice.resumeTitle} · {choice.versionNumberLabel}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="form-field form-field--full">
                      <span className="form-field__label">Transcript text override</span>
                      <textarea
                        className="form-input form-input--textarea"
                        onChange={(event) => setTranscriptText(event.target.value)}
                        placeholder="Optional: paste a transcript if you already have one."
                        rows={5}
                        value={transcriptText}
                      />
                      <span className="form-field__hint">
                        Optional. If omitted, the server will try to extract a transcript from the
                        audio and continue processing.
                      </span>
                    </label>
                  </div>
                  {createRecordMutation.isError ? (
                    <ErrorStateCard
                      body={
                        createRecordMutation.error instanceof Error
                          ? createRecordMutation.error.message
                          : "The interview record could not be created."
                      }
                      details={getErrorDetails(createRecordMutation.error)}
                      onAction={() => createRecordMutation.reset()}
                      title="Unable to create interview record"
                    />
                  ) : null}
                  <div className="page-card__actions">
                    <button
                      className="primary-button"
                      disabled={!file || createRecordMutation.isPending}
                      onClick={() => {
                        void handleCreateRecord();
                      }}
                      type="button"
                    >
                      {createRecordMutation.isPending ? "Uploading..." : "Create record"}
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => setUploadOpen(false)}
                      type="button"
                    >
                      Close form
                    </button>
                  </div>
                </section>
              ) : null}

              {recordListQuery.data && recordListQuery.data.length > 0 ? (
                <section className="page-card practical-record-list-card">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">Imported records</p>
                      <h2 className="page-card__title">Open a review workspace</h2>
                    </div>
                    <div className="chip-list">
                      <span className="detail-chip">Newest imports stay actionable here</span>
                    </div>
                  </div>
                  <div className="stack-list">
                    {recordListQuery.data.map((record) => (
                      <button
                        className="list-item-card practical-record-row"
                        key={record.id}
                        onClick={() => {
                          navigate(
                            routeConfig.practicalInterviewDetail.buildPath({ recordId: record.id }),
                          );
                        }}
                        type="button"
                      >
                        <div className="list-item-card__content">
                          <div className="list-item-card__meta">
                            <span>{record.interviewTypeLabel}</span>
                            {record.interviewDateLabel ? <span>{record.interviewDateLabel}</span> : null}
                            <span>{record.questionCount} questions</span>
                          </div>
                          <h3 className="list-item-card__title">{record.title}</h3>
                          <div className="chip-list practical-record-row__chips">
                            <span
                              className={`question-status-badge question-status-badge--${record.transcriptStatusTone}`}
                            >
                              Transcript {record.transcriptStatusLabel}
                            </span>
                            <span className="question-status-badge question-status-badge--accent">
                              Analysis {record.analysisStatusLabel}
                            </span>
                            {record.transcriptRetryCount > 0 ? (
                              <span className="detail-chip detail-chip--warning">
                                Retry {record.transcriptRetryCount}
                              </span>
                            ) : null}
                          </div>
                          <p className="list-item-card__body practical-record-row__body">
                            {record.transcriptStatus === "failed"
                              ? record.transcriptErrorLabel ??
                                "Automatic transcription failed. Open the record to retry or inspect the status."
                              : record.transcriptNextRetryAtLabel
                                ? `Next retry ${record.transcriptNextRetryAtLabel}`
                                : "Open transcript review, structured questions, follow-up threads, and replay readiness from one workspace."}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              ) : (
                !recordListQuery.isLoading &&
                !recordListQuery.isError && (
                  <EmptyStateCard
                    body="No imported interview records exist yet. Upload the first interview to open the review flow."
                    title="No practical interviews yet"
                  />
                )
              )}
            </div>

            <aside className="practical-list-layout__side">
              <SectionPanel className="workspace-note-card" variant="muted">
                <span className="page-card__label">Next surface</span>
                <h2 className="page-card__title">Each record should open one focused review system</h2>
                <p className="page-card__body">
                  The next screen should keep transcript quality, structured questions, follow-up
                  threads, and replay readiness aligned, not spread across unrelated tools.
                </p>
              </SectionPanel>
              <SectionPanel className="workspace-note-card" variant="muted">
                <span className="page-card__label">Queue habit</span>
                <h2 className="page-card__title">Process imports before they go stale</h2>
                <p className="page-card__body">
                  Records waiting on retries or transcript cleanup should be reviewed quickly so
                  their weak claims still map cleanly into the DFS interview practice loop.
                </p>
                <div className="practical-list-signal-list">
                  <div className="practical-list-signal-list__item">
                    <span>1. Stabilize queue</span>
                    <strong>Resolve processing and retry records before building a larger backlog.</strong>
                  </div>
                  <div className="practical-list-signal-list__item">
                    <span>2. Open recovery</span>
                    <strong>Use the next completed record to launch one focused review and replay cycle.</strong>
                  </div>
                </div>
                <div className="page-card__actions">
                  <button
                    className="primary-button"
                    onClick={() => setUploadOpen((current) => !current)}
                    type="button"
                  >
                    {uploadOpen ? "Hide upload form" : "Upload interview"}
                  </button>
                </div>
              </SectionPanel>
            </aside>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
