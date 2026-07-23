import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getActiveResumeVersion } from "../../entities/resume/model";
import { useActivateResumeVersionMutation } from "../../features/resume/api/useActivateResumeVersionMutation";
import { useCreateResumeMutation } from "../../features/resume/api/useCreateResumeMutation";
import { useReExtractResumeVersionMutation } from "../../features/resume/api/useReExtractResumeVersionMutation";
import { useResumeVersionDetailQuery } from "../../features/resume/api/useResumeVersionDetailQuery";
import { useResumeVersionExtractionQuery } from "../../features/resume/api/useResumeVersionExtractionQuery";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { useUploadResumeVersionMutation } from "../../features/resume/api/useUploadResumeVersionMutation";
import { routeConfig } from "../../shared/config/routes";
import { getErrorDetails } from "../../shared/api/errors";
import { queryKeys } from "../../shared/api/queryKeys";
import { downloadResumeVersionFileRequest } from "../../shared/api/resumeApi";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { useLayoutMode } from "../../shared/ui/layout";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { ResumeDesktopLayout, ResumeMobileLayout } from "./ResumeLayouts";
import {
  ActiveResumeOverviewCard,
  ResumeAchievementsCard,
  ResumeCompetenciesCard,
  ResumeContactsCard,
  ResumeCredentialSection,
  ResumeCreateForm,
  ResumeExperienceTimeline,
  ResumeList,
  ResumeProfileCard,
  ResumeProjectsCard,
  ResumeRiskList,
  ResumeSkillsCard,
} from "../../widgets/resume";

const parsedSectionLinks = [
  { id: "resume-section-profile", label: "Profile" },
  { id: "resume-section-contacts", label: "Contacts" },
  { id: "resume-section-competencies", label: "Competencies" },
  { id: "resume-section-skills", label: "Skills" },
  { id: "resume-section-experience", label: "Experience" },
  { id: "resume-section-projects", label: "Projects" },
  { id: "resume-section-achievements", label: "Achievements" },
  { id: "resume-section-education", label: "Education" },
  { id: "resume-section-certifications", label: "Certifications" },
  { id: "resume-section-awards", label: "Awards" },
  { id: "resume-section-risks", label: "Risks" },
] as const;

export function ResumePage() {
  const queryClient = useQueryClient();
  const resumeListQuery = useResumeListQuery();
  const { isDesktop } = useLayoutMode();
  const createResumeMutation = useCreateResumeMutation();
  const uploadResumeVersionMutation = useUploadResumeVersionMutation();
  const activateResumeVersionMutation = useActivateResumeVersionMutation();
  const reExtractResumeVersionMutation = useReExtractResumeVersionMutation();
  const [resumeTitle, setResumeTitle] = useState("");
  const [isCreateResumeOpen, setIsCreateResumeOpen] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(true);
  const [createStatus, setCreateStatus] = useState<string | null>(null);
  const [versionStatus, setVersionStatus] = useState<string | null>(null);
  const [activationStatus, setActivationStatus] = useState<string | null>(null);
  const [pendingUploadResumeId, setPendingUploadResumeId] = useState<string | null>(null);
  const [pendingActivationId, setPendingActivationId] = useState<string | null>(null);
  const [pendingDownloadId, setPendingDownloadId] = useState<string | null>(null);
  const [pendingReExtractId, setPendingReExtractId] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const previousParsingStatusRef = useRef<string | null>(null);
  const previousExtractionStatusRef = useRef<string | null>(null);
  const selectedVersionQuery = useResumeVersionDetailQuery(selectedVersionId, true);
  const selectedExtractionQuery = useResumeVersionExtractionQuery(selectedVersionId, true);
  const canLoadSnapshots =
    selectedVersionQuery.data?.parsingStatus === "completed" &&
    selectedExtractionQuery.data?.extractionStatus !== "pending" &&
    selectedExtractionQuery.data?.extractionStatus !== "processing";
  const snapshotsQuery = useResumeVersionSnapshotsQuery(
    selectedVersionId,
    canLoadSnapshots,
  );

  useEffect(() => {
    if (!resumeListQuery.data || selectedResumeId) {
      return;
    }

    const activeVersion = getActiveResumeVersion(resumeListQuery.data);

    if (activeVersion) {
      setSelectedResumeId(activeVersion.resumeId);
      setSelectedVersionId(activeVersion.id);
    } else {
      const firstResume = resumeListQuery.data.items[0];

      if (firstResume) {
        setSelectedResumeId(firstResume.id);
        setSelectedVersionId(firstResume.versions[0]?.id ?? null);
      }
    }
  }, [resumeListQuery.data, selectedResumeId]);

  useEffect(() => {
    if (!resumeListQuery.data || !selectedResumeId) {
      return;
    }

    const selectedResume = resumeListQuery.data.items.find((resume) => resume.id === selectedResumeId);

    if (!selectedResume) {
      return;
    }

    if (!selectedResume.versions.some((version) => version.id === selectedVersionId)) {
      const nextVersion = selectedResume.versions.find((version) => version.isActive) ?? selectedResume.versions[0];
      setSelectedVersionId(nextVersion?.id ?? null);
    }
  }, [resumeListQuery.data, selectedResumeId, selectedVersionId]);

  useEffect(() => {
    const currentStatus = selectedVersionQuery.data?.parsingStatus ?? null;
    const previousStatus = previousParsingStatusRef.current;

    previousParsingStatusRef.current = currentStatus;

    if (!currentStatus || currentStatus === previousStatus) {
      return;
    }

    if (
      (previousStatus === "pending" || previousStatus === "processing") &&
      (currentStatus === "completed" || currentStatus === "failed")
    ) {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.latest }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser }),
      ]);

      if (currentStatus === "completed") {
        setVersionStatus("Resume parsing completed. You can now activate this version.");
      }
    }
  }, [queryClient, selectedVersionQuery.data?.parsingStatus]);

  useEffect(() => {
    const currentStatus = selectedExtractionQuery.data?.extractionStatus ?? null;
    const previousStatus = previousExtractionStatusRef.current;

    previousExtractionStatusRef.current = currentStatus;

    if (!currentStatus || currentStatus === previousStatus) {
      return;
    }

    if (
      (previousStatus === "pending" || previousStatus === "processing") &&
      ["completed", "failed", "skipped", "fallback"].includes(currentStatus)
    ) {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.latest }),
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.snapshots(selectedVersionId ?? "") }),
      ]);

      if (currentStatus === "completed") {
        setVersionStatus("Structured extraction completed. Resume insights are ready.");
      }
    }
  }, [queryClient, selectedExtractionQuery.data?.extractionStatus, selectedVersionId]);

  async function handleCreateResume() {
    setCreateStatus(null);
    try {
      await createResumeMutation.mutateAsync({
        title: resumeTitle,
      });
      setCreateStatus("Resume created.");
      setResumeTitle("");
      setIsCreateResumeOpen(false);
    } catch {
      return;
    }
  }

  async function handleUploadVersion(resumeId: string, file: File) {
    setVersionStatus(null);
    setPendingUploadResumeId(resumeId);
    try {
      const uploadedVersion = await uploadResumeVersionMutation.mutateAsync({
        resumeId,
        file,
      });
      setSelectedResumeId(resumeId);
      setSelectedVersionId(String(uploadedVersion.id));
      setVersionStatus("Resume PDF uploaded. Parsing has started.");
    } catch {
      return;
    } finally {
      setPendingUploadResumeId(null);
    }
  }

  async function handleActivate(versionId: string) {
    setActivationStatus(null);
    setPendingActivationId(versionId);
    try {
      await activateResumeVersionMutation.mutateAsync(versionId);
      setActivationStatus("Version activated.");
    } catch {
      return;
    } finally {
      setPendingActivationId(null);
    }
  }

  async function handleReExtract(versionId: string) {
    setVersionStatus(null);
    setPendingReExtractId(versionId);
    try {
      await reExtractResumeVersionMutation.mutateAsync(versionId);
      setVersionStatus("Structured extraction restarted. The page will refresh until the status changes.");
      void Promise.all([
        selectedVersionQuery.refetch(),
        selectedExtractionQuery.refetch(),
      ]);
    } catch {
      return;
    } finally {
      setPendingReExtractId(null);
    }
  }

  async function handleDownloadVersion(versionId: string) {
    setPendingDownloadId(versionId);
    try {
      const blob = await downloadResumeVersionFileRequest(versionId);
      const selectedFileName =
        selectedVersionQuery.data?.id === versionId
          ? selectedVersionQuery.data.fileNameLabel
          : `resume-version-${versionId}.pdf`;
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = selectedFileName.endsWith(".pdf") ? selectedFileName : `${selectedFileName}.pdf`;
      window.document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);
    } finally {
      setPendingDownloadId(null);
    }
  }

  return (
    <PageContainer
      description="Manage resume containers, upload PDF versions, watch parsing status, and inspect extracted interview context."
      eyebrow="Resume"
      title="Resume management"
    >
      {isCreateResumeOpen ? (
        <div
          aria-modal="true"
          className="resume-create-modal"
          onClick={() => {
            if (!createResumeMutation.isPending) {
              setIsCreateResumeOpen(false);
            }
          }}
          role="dialog"
        >
          <div
            className="resume-create-modal__surface"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <ResumeCreateForm
              className="resume-create-modal__card"
              errorMessage={createResumeMutation.error instanceof Error ? createResumeMutation.error.message : null}
              errorDetails={getErrorDetails(createResumeMutation.error)}
              isPending={createResumeMutation.isPending}
              onCancel={() => {
                if (!createResumeMutation.isPending) {
                  setIsCreateResumeOpen(false);
                }
              }}
              onSubmit={() => {
                void handleCreateResume();
              }}
              onTitleChange={setResumeTitle}
              statusMessage={createStatus}
              title={resumeTitle}
            />
          </div>
        </div>
      ) : null}
      {(() => {
        const notices = (
          <>
            {versionStatus ? <FeedbackNotice message={versionStatus} tone="success" /> : null}
            {activationStatus ? <FeedbackNotice message={activationStatus} tone="success" /> : null}
            {uploadResumeVersionMutation.error instanceof Error ? (
              <FeedbackNotice details={getErrorDetails(uploadResumeVersionMutation.error)} message={uploadResumeVersionMutation.error.message} tone="error" />
            ) : null}
            {activateResumeVersionMutation.error instanceof Error ? (
              <FeedbackNotice details={getErrorDetails(activateResumeVersionMutation.error)} message={activateResumeVersionMutation.error.message} tone="error" />
            ) : null}
            {reExtractResumeVersionMutation.error instanceof Error ? (
              <FeedbackNotice details={getErrorDetails(reExtractResumeVersionMutation.error)} message={reExtractResumeVersionMutation.error.message} tone="error" />
            ) : null}
          </>
        );
        const profileCard = (
          <section className="page-card">
            <span className="page-card__label">Profile</span>
            <h2 className="page-card__title">Profile and analysis</h2>
            <div className="page-card__actions">
              <Link className="secondary-button" to={routeConfig.profile.buildPath()}>
                Back to profile
              </Link>
              <Link className="primary-button" to={routeConfig.resumeAnalysis.buildPath()}>
                Open analysis
              </Link>
            </div>
          </section>
        );
        const overviewCard =
          resumeListQuery.data ? <ActiveResumeOverviewCard resumeList={resumeListQuery.data} /> : null;
        const libraryIntro = (
          <section className="page-card page-card--muted">
            <div className="section-heading">
              <div>
                <span className="page-card__label">Resume library</span>
                <h2 className="page-card__title">Resume containers and selected version</h2>
                <p className="page-card__body">
                  Pick one resume container, upload new PDF versions, and inspect the currently selected version without pushing the parsed result view too far down the page.
                </p>
              </div>
              <div className="page-card__actions resume-library__actions">
                <button
                  className="primary-button"
                  onClick={() => {
                    setCreateStatus(null);
                    setIsCreateResumeOpen(true);
                  }}
                  type="button"
                >
                  + Create resume
                </button>
              </div>
            </div>
          </section>
        );
        const listContent = (
          <>
            {resumeListQuery.isLoading ? (
              <LoadingStateCard
                body="Loading resume containers and their versions."
                title="Preparing resumes"
              />
            ) : null}

            {resumeListQuery.isError ? (
              <ErrorStateCard
                body={
                  resumeListQuery.error instanceof Error
                    ? resumeListQuery.error.message
                    : "The resume list could not be loaded."
                }
                details={getErrorDetails(resumeListQuery.error)}
                onAction={() => {
                  void resumeListQuery.refetch();
                }}
                title="Unable to load resumes"
              />
            ) : null}

            {!resumeListQuery.isLoading && !resumeListQuery.isError && resumeListQuery.data && resumeListQuery.data.items.length === 0 ? (
              <EmptyStateCard
                action={{
                  label: "Back to profile",
                  to: routeConfig.profile.buildPath(),
                }}
                body="Create your first resume to start attaching versions."
                title="No resumes yet"
              />
            ) : null}

            {!resumeListQuery.isLoading && !resumeListQuery.isError && resumeListQuery.data && resumeListQuery.data.items.length > 0 ? (
              <>
                <ResumeList
                  items={resumeListQuery.data.items}
                  layout={isDesktop ? "grid" : "stack"}
                  onSelectResume={setSelectedResumeId}
                  onSelectVersion={setSelectedVersionId}
                  onUploadVersion={(resumeId, file) => {
                    void handleUploadVersion(resumeId, file);
                  }}
                  pendingUploadResumeId={pendingUploadResumeId}
                  selectedResumeId={selectedResumeId}
                  selectedVersionId={selectedVersionId}
                />

                {selectedResumeId && !selectedVersionId ? (
                  <section className="page-card">
                    <div className="section-heading">
                      <div>
                        <p className="section-heading__eyebrow">Selected resume</p>
                        <h2 className="page-card__title">
                          {resumeListQuery.data.items.find((resume) => resume.id === selectedResumeId)?.title ?? "Resume"}
                        </h2>
                      </div>
                    </div>
                    <p className="page-card__body">
                      This resume container has no uploaded versions yet. Upload a PDF to start parsing skills, experiences, and risks.
                    </p>
                    <div className="page-card__actions">
                      <label className="primary-button resume-upload-button">
                        <input
                          accept="application/pdf"
                          className="resume-upload-button__input"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              void handleUploadVersion(selectedResumeId, file);
                            }
                            event.target.value = "";
                          }}
                          type="file"
                        />
                        Upload first PDF version
                      </label>
                    </div>
                  </section>
                ) : null}

                {selectedVersionId ? (
                  selectedVersionQuery.isLoading ? (
                    <LoadingStateCard
                      body="Loading version metadata and parsing progress."
                      title="Preparing selected version"
                    />
                  ) : selectedVersionQuery.isError ? (
                    <ErrorStateCard
                      body={
                        selectedVersionQuery.error instanceof Error
                          ? selectedVersionQuery.error.message
                          : "The selected resume version could not be loaded."
                      }
                      details={getErrorDetails(selectedVersionQuery.error)}
                      onAction={() => {
                        void selectedVersionQuery.refetch();
                      }}
                      title="Unable to load resume version"
                    />
                  ) : selectedVersionQuery.data ? (
                    <section className="page-card">
                      <div className="section-heading">
                        <div>
                          <p className="section-heading__eyebrow">Selected version</p>
                          <h2 className="page-card__title">{selectedVersionQuery.data.fileNameLabel}</h2>
                        </div>
                        <div className="resume-status-badges">
                          {selectedVersionQuery.data.isActive ? (
                            <span className="question-status-badge question-status-badge--positive">Active version</span>
                          ) : null}
                          <span className={`question-status-badge question-status-badge--${selectedVersionQuery.data.parsingTone}`}>
                            Parsing: {selectedVersionQuery.data.parsingStatusLabel}
                          </span>
                          <span className={`question-status-badge question-status-badge--${selectedVersionQuery.data.extractionTone}`}>
                            Extraction: {selectedVersionQuery.data.extractionStatusLabel}
                          </span>
                        </div>
                      </div>
                      <div className="page-card__actions resume-version-toolbar">
                        {selectedResumeId ? (
                          <label className="secondary-button resume-upload-button">
                            <input
                              accept="application/pdf"
                              className="resume-upload-button__input"
                              disabled={pendingUploadResumeId === selectedResumeId}
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) {
                                  void handleUploadVersion(selectedResumeId, file);
                                }
                                event.target.value = "";
                              }}
                              type="file"
                            />
                            {pendingUploadResumeId === selectedResumeId ? "Uploading..." : "Upload replacement PDF"}
                          </label>
                        ) : null}
                        <button
                          className="secondary-button"
                          disabled={!selectedVersionQuery.data.canDownload || pendingDownloadId === selectedVersionQuery.data.id}
                          onClick={() => {
                            void handleDownloadVersion(selectedVersionQuery.data.id);
                          }}
                          type="button"
                        >
                          {pendingDownloadId === selectedVersionQuery.data.id ? "Downloading..." : "Download PDF"}
                        </button>
                      </div>
                      <div className="stats-grid">
                        <article className="stat-tile">
                          <p className="stat-tile__label">Uploaded</p>
                          <strong className="stat-tile__value stat-tile__value--small">
                            {selectedVersionQuery.data.uploadedAtLabel ?? "Unknown"}
                          </strong>
                        </article>
                        <article className="stat-tile">
                          <p className="stat-tile__label">File</p>
                          <strong className="stat-tile__value stat-tile__value--small">
                            {selectedVersionQuery.data.fileSizeLabel ?? selectedVersionQuery.data.fileTypeLabel ?? "Unknown"}
                          </strong>
                        </article>
                        <article className="stat-tile">
                          <p className="stat-tile__label">Parsing started</p>
                          <strong className="stat-tile__value stat-tile__value--small">
                            {selectedVersionQuery.data.parseStartedAtLabel ?? "Waiting"}
                          </strong>
                        </article>
                        <article className="stat-tile">
                          <p className="stat-tile__label">Parsing finished</p>
                          <strong className="stat-tile__value stat-tile__value--small">
                            {selectedVersionQuery.data.parseCompletedAtLabel ?? "Not finished"}
                          </strong>
                        </article>
                        <article className="stat-tile">
                          <p className="stat-tile__label">Extraction started</p>
                          <strong className="stat-tile__value stat-tile__value--small">
                            {selectedExtractionQuery.data?.startedAtLabel ?? selectedVersionQuery.data.extractionStartedAtLabel ?? "Waiting"}
                          </strong>
                        </article>
                        <article className="stat-tile">
                          <p className="stat-tile__label">Extraction finished</p>
                          <strong className="stat-tile__value stat-tile__value--small">
                            {selectedExtractionQuery.data?.completedAtLabel ?? selectedVersionQuery.data.extractionCompletedAtLabel ?? "Not finished"}
                          </strong>
                        </article>
                      </div>
                      {selectedVersionQuery.data.parseErrorMessage ? (
                        <FeedbackNotice message={selectedVersionQuery.data.parseErrorMessage} tone="error" />
                      ) : null}
                      {selectedExtractionQuery.data?.errorMessage ? (
                        <FeedbackNotice
                          message={selectedExtractionQuery.data.errorMessage}
                          tone={selectedExtractionQuery.data.extractionStatus === "failed" ? "error" : "info"}
                        />
                      ) : selectedVersionQuery.data.extractionErrorMessage ? (
                        <FeedbackNotice
                          message={selectedVersionQuery.data.extractionErrorMessage}
                          tone={selectedVersionQuery.data.extractionStatus === "failed" ? "error" : "info"}
                        />
                      ) : null}
                      {selectedVersionQuery.data.parsingStatus === "pending" ||
                      selectedVersionQuery.data.parsingStatus === "processing" ? (
                        <FeedbackNotice
                          message="Parsing is still in progress. The page will keep refreshing until the status changes."
                          tone="info"
                        />
                      ) : null}
                      {selectedExtractionQuery.isLoading && selectedVersionQuery.data.parsingStatus === "completed" ? (
                        <FeedbackNotice
                          message="Structured extraction status is loading."
                          tone="info"
                        />
                      ) : null}
                      {selectedExtractionQuery.data?.extractionStatus === "pending" ||
                      selectedExtractionQuery.data?.extractionStatus === "processing" ? (
                        <FeedbackNotice
                          message="Structured extraction is still running. Parsed snapshots will appear after the status changes."
                          tone="info"
                        />
                      ) : null}
                      {selectedExtractionQuery.data?.extractionStatus === "skipped" ? (
                        <div className="resume-version-feedback">
                          <FeedbackNotice
                            message="Structured extraction was skipped. This resume version remains usable, and any available snapshots are still shown below."
                            tone="info"
                          />
                        </div>
                      ) : null}
                      {selectedExtractionQuery.data?.extractionStatus === "fallback" ? (
                        <FeedbackNotice
                          message="Deterministic fallback extraction was used. This resume version remains usable for interview context."
                          tone="info"
                        />
                      ) : null}
                      {selectedExtractionQuery.isError ? (
                        <FeedbackNotice
                          message={
                            selectedExtractionQuery.error instanceof Error
                              ? selectedExtractionQuery.error.message
                              : "Structured extraction status could not be loaded."
                          }
                          details={getErrorDetails(selectedExtractionQuery.error)}
                          tone="error"
                        />
                      ) : null}
                      <section className="page-card page-card--muted">
                        <div className="section-heading">
                          <div>
                            <p className="section-heading__eyebrow">Structured extraction</p>
                            <h3 className="page-card__title">Extraction status and metadata</h3>
                          </div>
                        </div>
                        <div className="stats-grid">
                          <article className="stat-tile">
                            <p className="stat-tile__label">Raw parsing</p>
                            <strong className="stat-tile__value stat-tile__value--small">
                              {selectedExtractionQuery.data?.rawParsingStatusLabel ?? selectedVersionQuery.data.parsingStatusLabel}
                            </strong>
                          </article>
                          <article className="stat-tile">
                            <p className="stat-tile__label">Structured extraction</p>
                            <strong className="stat-tile__value stat-tile__value--small">
                              {selectedExtractionQuery.data?.extractionStatusLabel ?? selectedVersionQuery.data.extractionStatusLabel}
                            </strong>
                          </article>
                          <article className="stat-tile">
                            <p className="stat-tile__label">Model</p>
                            <strong className="stat-tile__value stat-tile__value--small">
                              {selectedExtractionQuery.data?.modelLabel ?? selectedVersionQuery.data.extractionModelLabel ?? "Not available"}
                            </strong>
                          </article>
                          <article className="stat-tile">
                            <p className="stat-tile__label">Prompt version</p>
                            <strong className="stat-tile__value stat-tile__value--small">
                              {selectedExtractionQuery.data?.promptVersionLabel ?? selectedVersionQuery.data.extractionPromptVersion ?? "Not available"}
                            </strong>
                          </article>
                          <article className="stat-tile">
                            <p className="stat-tile__label">Confidence</p>
                            <strong className="stat-tile__value stat-tile__value--small">
                              {selectedVersionQuery.data.extractionConfidenceLabel ?? "Not available"}
                            </strong>
                          </article>
                        </div>
                        {selectedVersionQuery.data.parsingStatus === "completed" ? (
                          <div className="page-card__actions">
                            <button
                              className="secondary-button"
                              disabled={pendingReExtractId === selectedVersionQuery.data.id}
                              onClick={() => {
                                void handleReExtract(selectedVersionQuery.data.id);
                              }}
                              type="button"
                            >
                              {pendingReExtractId === selectedVersionQuery.data.id
                                ? "Re-running extraction..."
                                : "Re-run extraction"}
                            </button>
                            {selectedExtractionQuery.isError ? (
                              <button
                                className="secondary-button"
                                onClick={() => {
                                  void selectedExtractionQuery.refetch();
                                }}
                                type="button"
                              >
                                Retry status check
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </section>
                      <section className="resume-version-activation-panel">
                        <div>
                          <p className="section-heading__eyebrow">Interview context</p>
                          <h3 className="page-card__title">Use this version for answer evaluation</h3>
                          <p className="page-card__body">
                            {selectedVersionQuery.data.isActive
                              ? "This resume version is already active. New answers and resume-driven recommendations will use it."
                              : selectedVersionQuery.data.canActivate
                                ? "Activate this parsed version to drive question matching, answer evaluation, and resume intelligence."
                                : selectedVersionQuery.data.parsingStatus === "failed"
                                  ? "This version cannot become active until you upload a version that parses successfully."
                                  : "Activation becomes available after parsing completes successfully."}
                          </p>
                        </div>
                        <div className="page-card__actions">
                          <button
                            className="primary-button"
                            disabled={
                              selectedVersionQuery.data.isActive ||
                              !selectedVersionQuery.data.canActivate ||
                              pendingActivationId === selectedVersionQuery.data.id
                            }
                            onClick={() => {
                              void handleActivate(selectedVersionQuery.data.id);
                            }}
                            type="button"
                          >
                            {selectedVersionQuery.data.isActive
                              ? "Active version"
                              : pendingActivationId === selectedVersionQuery.data.id
                                ? "Activating..."
                                : "Activate for interview context"}
                          </button>
                          <Link className="secondary-button" to={routeConfig.resumeAnalysis.buildPath()}>
                            Open resume analysis
                          </Link>
                          <Link
                            className="secondary-button"
                            to={routeConfig.resumeEditor.buildPath({
                              versionId: selectedVersionQuery.data.id,
                            })}
                          >
                            Open resume editor
                          </Link>
                          <Link
                            className="secondary-button"
                            to={routeConfig.resumeHeatmap.buildPath({
                              versionId: selectedVersionQuery.data.id,
                            })}
                          >
                            Open interview heatmap
                          </Link>
                        </div>
                      </section>
                    </section>
                  ) : null
                ) : null}

                {selectedVersionQuery.data?.parsingStatus === "completed" ? (
                  !canLoadSnapshots ? (
                    <LoadingStateCard
                      body="Waiting for structured extraction to settle before loading version snapshots."
                      title="Preparing resume details"
                    />
                  ) : snapshotsQuery.isLoading ? (
                    <LoadingStateCard
                      body="Loading extracted profile, contacts, competencies, skills, experience, projects, achievements, credentials, and risks."
                      title="Preparing parsed resume details"
                    />
                  ) : snapshotsQuery.isError ? (
                    selectedExtractionQuery.data?.extractionStatus === "failed" ? (
                      <FeedbackNotice
                        details={getErrorDetails(snapshotsQuery.error)}
                        message={
                          snapshotsQuery.error instanceof Error
                            ? snapshotsQuery.error.message
                            : "Structured extraction failed and no snapshot sections were available."
                        }
                        tone="info"
                      />
                    ) : (
                      <ErrorStateCard
                        body={
                          snapshotsQuery.error instanceof Error
                            ? snapshotsQuery.error.message
                            : "The parsed resume details could not be loaded."
                        }
                        details={getErrorDetails(snapshotsQuery.error)}
                        onAction={() => {
                          void snapshotsQuery.refetch();
                        }}
                        title="Unable to load parsed resume details"
                      />
                    )
                  ) : snapshotsQuery.data ? (
                    <div className="resume-document-layout">
                      <div className="page-stack">
                        <ResumeProfileCard
                          profile={snapshotsQuery.data.profile}
                          sectionId="resume-section-profile"
                        />
                        <ResumeContactsCard
                          contacts={snapshotsQuery.data.contacts}
                          sectionId="resume-section-contacts"
                        />
                        <ResumeCompetenciesCard
                          competencies={snapshotsQuery.data.competencies}
                          sectionId="resume-section-competencies"
                        />
                        <ResumeSkillsCard
                          sectionId="resume-section-skills"
                          skills={snapshotsQuery.data.skills}
                        />
                        <ResumeExperienceTimeline
                          experiences={snapshotsQuery.data.experiences}
                          sectionId="resume-section-experience"
                        />
                        <ResumeProjectsCard
                          projects={snapshotsQuery.data.projects}
                          sectionId="resume-section-projects"
                        />
                        <ResumeAchievementsCard
                          achievements={snapshotsQuery.data.achievements}
                          sectionId="resume-section-achievements"
                        />
                        <ResumeCredentialSection
                          emptyMessage="No education entries are available for this version yet."
                          eyebrow="Education"
                          items={snapshotsQuery.data.education.map((item) => ({
                            id: item.id,
                            title: [item.institutionName, item.degreeName].filter(Boolean).join(" · ") || item.institutionName,
                            meta: [item.fieldOfStudy, item.dateLabel].filter(
                              (value): value is string => Boolean(value),
                            ),
                            body: item.description,
                          }))}
                          sectionId="resume-section-education"
                          title="Education history"
                        />
                        <ResumeCredentialSection
                          emptyMessage="No certification entries are available for this version yet."
                          eyebrow="Certifications"
                          items={snapshotsQuery.data.certifications.map((item) => ({
                            id: item.id,
                            title: item.name,
                            meta: [item.issuerName, item.credentialCode, item.dateLabel, item.scoreText].filter(
                              (value): value is string => Boolean(value),
                            ),
                          }))}
                          sectionId="resume-section-certifications"
                          title="Certifications and credential evidence"
                        />
                        <ResumeCredentialSection
                          emptyMessage="No award entries are available for this version yet."
                          eyebrow="Awards"
                          items={snapshotsQuery.data.awards.map((item) => ({
                            id: item.id,
                            title: item.title,
                            meta: [item.issuerName, item.awardedOnLabel].filter(
                              (value): value is string => Boolean(value),
                            ),
                            body: item.description,
                          }))}
                          sectionId="resume-section-awards"
                          title="Awards and recognitions"
                        />
                        <ResumeRiskList
                          risks={snapshotsQuery.data.risks}
                          sectionId="resume-section-risks"
                        />
                      </div>
                    </div>
                  ) : null
                ) : null}
              </>
            ) : null}
          </>
        );

        if (!isDesktop) {
            return (
              <ResumeMobileLayout
                libraryIntro={libraryIntro}
                listContent={listContent}
                notices={notices}
                overviewCard={overviewCard}
              profileCard={profileCard}
            />
          );
        }

            return (
              <ResumeDesktopLayout
                libraryIntro={libraryIntro}
                listContent={listContent}
                notices={notices}
                overviewCard={overviewCard}
            profileCard={profileCard}
          />
        );
      })()}
      {selectedVersionQuery.data?.parsingStatus === "completed" && snapshotsQuery.data ? (
        <div className={`resume-floating-outline${isOutlineOpen ? " resume-floating-outline--open" : ""}`}>
          <button
            aria-expanded={isOutlineOpen}
            className="resume-floating-outline__toggle"
            onClick={() => {
              setIsOutlineOpen((current) => !current);
            }}
            type="button"
          >
            {isOutlineOpen ? "Hide outline" : "Outline"}
          </button>
          {isOutlineOpen ? (
            <aside className="page-card page-card--muted resume-floating-outline__panel">
              <div className="section-heading">
                <div>
                  <span className="page-card__label">Outline</span>
                  <h3 className="page-card__title">Jump to a resume section</h3>
                </div>
              </div>
              <div className="resume-outline-list">
                {parsedSectionLinks.map((section) => (
                  <a className="resume-outline-link" href={`#${section.id}`} key={section.id}>
                    {section.label}
                  </a>
                ))}
              </div>
            </aside>
          ) : null}
        </div>
      ) : null}
    </PageContainer>
  );
}
