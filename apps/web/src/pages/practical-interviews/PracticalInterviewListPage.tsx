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
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageContainer } from "../../shared/ui/PageContainer";

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
      description="Upload practical interview artifacts, inspect imported records, and open a review-ready interview replay workspace."
      eyebrow="Practical Interview"
      title="Practical interview review"
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
        <div className="page-stack">
          <section className="page-card">
            <span className="page-card__label">Workspace</span>
            <h2 className="page-card__title">Upload and review real interview transcripts</h2>
            <p className="page-card__body">
              The backend review payload already includes provenance, lane ordering, blockers, and replay presets. The frontend only needs to render and route those decisions.
            </p>
            <div className="stats-grid">
              <MetricCard
                label="Imported records"
                value={String(recordListQuery.data?.length ?? 0)}
              />
              <MetricCard
                label="Resume versions"
                tone="accent"
                value={String(resumeChoices.length)}
              />
              <MetricCard
                label="Upload"
                tone="muted"
                value={file ? file.name : "Choose file"}
              />
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
          </section>

          {uploadOpen ? (
            <section className="page-card page-card--inset">
              <span className="page-card__label">Upload</span>
              <h2 className="page-card__title">Create an interview record</h2>
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
                    Upload the interview audio. The server can extract a transcript automatically if you do not paste one below.
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
                    Optional. If omitted, the server will try to extract a transcript from the audio and continue processing.
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
              </div>
            </section>
          ) : null}

          {recordListQuery.data && recordListQuery.data.length > 0 ? (
            <section className="page-card">
              <span className="page-card__label">Imported records</span>
              <h2 className="page-card__title">Open a review workspace</h2>
              <div className="stack-list">
                {recordListQuery.data.map((record) => (
                  <button
                    className="list-item-card practical-record-row"
                    key={record.id}
                    onClick={() => {
                      navigate(routeConfig.practicalInterviewDetail.buildPath({ recordId: record.id }));
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
      ) : null}
    </PageContainer>
  );
}
