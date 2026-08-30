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
import { useLocale } from "../../shared/i18n";
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
  { id: "resume-section-profile", label: "프로필" },
  { id: "resume-section-contacts", label: "연락처" },
  { id: "resume-section-competencies", label: "역량" },
  { id: "resume-section-skills", label: "스킬" },
  { id: "resume-section-experience", label: "경력" },
  { id: "resume-section-projects", label: "프로젝트" },
  { id: "resume-section-achievements", label: "성과" },
  { id: "resume-section-education", label: "학력" },
  { id: "resume-section-certifications", label: "자격증" },
  { id: "resume-section-awards", label: "수상" },
  { id: "resume-section-risks", label: "리스크" },
] as const;

export function ResumePage() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
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
  const resumeCount = resumeListQuery.data?.items.length ?? 0;
  const versionCount =
    resumeListQuery.data?.items.reduce((count, resume) => count + resume.versions.length, 0) ?? 0;
  const activeResume = resumeListQuery.data ? getActiveResumeVersion(resumeListQuery.data) : null;
  const activeVersionLabel = activeResume?.versionNumberLabel ?? (isKorean ? "활성 버전 없음" : "No active version");
  const extractionReadinessLabel = selectedExtractionQuery.data?.isUsable
    ? isKorean
      ? "준비 완료"
      : "Ready"
    : selectedVersionQuery.data?.parsingStatus === "completed"
      ? isKorean
        ? "파싱 완료"
        : "Parsing done"
      : isKorean
        ? "진행 중"
        : "In progress";
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
        setVersionStatus(isKorean ? "이력서 파싱이 완료되었습니다. 이제 이 버전을 활성화할 수 있습니다." : "Resume parsing completed. You can now activate this version.");
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
        setVersionStatus(isKorean ? "구조화 추출이 완료되었습니다. 이력서 인사이트를 확인할 수 있습니다." : "Structured extraction completed. Resume insights are ready.");
      }
    }
  }, [queryClient, selectedExtractionQuery.data?.extractionStatus, selectedVersionId]);

  async function handleCreateResume() {
    setCreateStatus(null);
    try {
      await createResumeMutation.mutateAsync({
        title: resumeTitle,
      });
      setCreateStatus(isKorean ? "이력서를 생성했습니다." : "Resume created.");
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
      setVersionStatus(isKorean ? "이력서 PDF를 업로드했습니다. 파싱을 시작했습니다." : "Resume PDF uploaded. Parsing has started.");
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
      setActivationStatus(isKorean ? "버전을 활성화했습니다." : "Version activated.");
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
      setVersionStatus(
        isKorean
          ? "구조화 추출을 다시 시작했습니다. 상태가 바뀔 때까지 페이지가 새로고침됩니다."
          : "Structured extraction restarted. The page will refresh until the status changes.",
      );
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
      description={isKorean ? "이력서 컨테이너를 관리하고, PDF 버전을 업로드하고, 파싱 상태와 추출된 인터뷰 컨텍스트를 확인하세요." : "Manage resume containers, upload PDF versions, watch parsing status, and inspect extracted interview context."}
      eyebrow={isKorean ? "이력서 소스" : "Resume sources"}
      title={isKorean ? "이력서 관리" : "Resume management"}
    >
      <section className="page-card resume-workspace-surface">
        <div className="resume-workspace-surface__header">
          <div className="resume-workspace-surface__intro">
            <div className="resume-workspace-surface__eyebrow-row">
              <span className="page-card__label">{isKorean ? "이력서 워크스페이스" : "Resume workspace"}</span>
              <span className="question-status-badge question-status-badge--accent">{isKorean ? "근거 레인" : "Evidence lane"}</span>
            </div>
            <p className="resume-workspace-surface__breadcrumbs">
              {isKorean ? "컨테이너" : "Containers"}
              <span>/</span>
              {isKorean ? "활성 버전" : "Active version"}
              <span>/</span>
              {isKorean ? "파싱된 근거" : "Parsed evidence"}
            </p>
            <h2 className="resume-workspace-surface__title">{isKorean ? "방어 가능한 기준 문서를 하나 구축하세요" : "Build one defendable source of truth"}</h2>
            <p className="resume-workspace-surface__body">
              {isKorean
                ? "이력서 업로드는 단순한 파일 보관이 아닙니다. 각 활성 버전은 가장 작은 주장까지 DFS 방식의 꼬리질문을 견뎌야 하는 인터뷰 근거가 됩니다."
                : "Resume uploads are not just files. Each active version becomes interview evidence that should survive DFS-style follow-up questioning down to the smallest claim."}
            </p>
          </div>
          <div className="resume-workspace-surface__stats">
            <article className="resume-workspace-surface__stat">
              <span>{isKorean ? "컨테이너" : "Containers"}</span>
              <strong>{resumeCount}</strong>
            </article>
            <article className="resume-workspace-surface__stat">
              <span>{isKorean ? "버전" : "Versions"}</span>
              <strong>{versionCount}</strong>
            </article>
            <article className="resume-workspace-surface__stat">
              <span>{isKorean ? "현재 활성 포커스" : "Active focus"}</span>
              <strong>{activeVersionLabel}</strong>
            </article>
            <article className="resume-workspace-surface__stat">
              <span>{isKorean ? "추출" : "Extraction"}</span>
              <strong>{extractionReadinessLabel}</strong>
            </article>
          </div>
        </div>
        <div className="resume-workspace-surface__chips">
          {selectedVersionQuery.data?.fileNameLabel ? (
            <span className="detail-chip">{selectedVersionQuery.data.fileNameLabel}</span>
          ) : null}
          {selectedExtractionQuery.data?.extractionStatusLabel ? (
            <span className="detail-chip detail-chip--accent">
              {isKorean ? `상태 ${selectedExtractionQuery.data.extractionStatusLabel}` : `Status ${selectedExtractionQuery.data.extractionStatusLabel}`}
            </span>
          ) : null}
          {snapshotsQuery.data?.projects.length ? (
            <span className="detail-chip">{isKorean ? `프로젝트 ${snapshotsQuery.data.projects.length}` : `Projects ${snapshotsQuery.data.projects.length}`}</span>
          ) : null}
          {snapshotsQuery.data?.risks.length ? (
            <span className="detail-chip">{isKorean ? `리스크 ${snapshotsQuery.data.risks.length}` : `Risks ${snapshotsQuery.data.risks.length}`}</span>
          ) : null}
        </div>
        <div className="resume-workspace-surface__guidance">
          <article className="resume-workspace-surface__guidance-card">
            <span>{isKorean ? "활성 경계" : "Active boundary"}</span>
            <strong>{isKorean ? "방어 가능한 수준으로 주장이 안정될 때까지 하나의 버전을 인터뷰 기준 문서로 유지하세요." : "Keep one version active as the interview source of truth until its claims are stable enough to defend"}</strong>
          </article>
          <article className="resume-workspace-surface__guidance-card">
            <span>{isKorean ? "다음 단계" : "Next step"}</span>
            <strong>{isKorean ? "업로드하고, 파싱하고, 활성화한 뒤 새 버전을 모의 세션에 쓰기 전에 리스크를 점검하세요." : "Upload, parse, activate, then inspect risks before using a new version in mock sessions"}</strong>
          </article>
        </div>
      </section>
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
            <span className="page-card__label">{isKorean ? "프로필" : "Profile"}</span>
            <h2 className="page-card__title">{isKorean ? "프로필과 분석 실행 도구" : "Profile and analysis launchers"}</h2>
            <div className="page-card__actions">
              <Link className="secondary-button" to={routeConfig.profile.buildPath()}>
                {isKorean ? "프로필로 돌아가기" : "Back to profile"}
              </Link>
              <Link className="primary-button" to={routeConfig.resumeAnalysis.buildPath()}>
                {isKorean ? "분석 열기" : "Open analysis"}
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
                <span className="page-card__label">{isKorean ? "이력서 라이브러리" : "Resume library"}</span>
                <h2 className="page-card__title">{isKorean ? "이력서 컨테이너와 선택된 버전" : "Resume containers and selected version"}</h2>
                <p className="page-card__body">
                  {isKorean
                    ? "이력서 컨테이너 하나를 고르고, 새 PDF 버전을 업로드한 뒤, 파싱 결과 화면이 너무 아래로 밀리지 않도록 현재 선택된 버전을 바로 점검하세요."
                    : "Pick one resume container, upload new PDF versions, and inspect the currently selected version without pushing the parsed result view too far down the page."}
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
                  {isKorean ? "+ 이력서 만들기" : "+ Create resume"}
                </button>
              </div>
            </div>
            <div className="resume-library__summary">
              <article className="resume-library__summary-item">
                <span>{isKorean ? "선택된 컨테이너" : "Selected container"}</span>
                <strong>
                  {selectedResumeId
                    ? resumeListQuery.data?.items.find((resume) => resume.id === selectedResumeId)?.title ?? (isKorean ? "이력서" : "Resume")
                    : isKorean
                      ? "선택된 컨테이너 없음"
                      : "No container selected"}
                </strong>
              </article>
              <article className="resume-library__summary-item">
                <span>{isKorean ? "선택된 버전" : "Selected version"}</span>
                <strong>{selectedVersionQuery.data?.fileNameLabel ?? (isKorean ? "버전을 선택하거나 업로드하세요" : "Choose or upload a version")}</strong>
              </article>
              <article className="resume-library__summary-item">
                <span>{isKorean ? "인터뷰 준비도" : "Interview readiness"}</span>
                <strong>{extractionReadinessLabel}</strong>
              </article>
            </div>
          </section>
        );
        const listContent = (
          <>
            {resumeListQuery.isLoading ? (
              <LoadingStateCard
                body={isKorean ? "이력서 컨테이너와 버전 목록을 불러오는 중입니다." : "Loading resume containers and their versions."}
                title={isKorean ? "이력서 준비 중" : "Preparing resumes"}
              />
            ) : null}

            {resumeListQuery.isError ? (
              <ErrorStateCard
                body={
                  resumeListQuery.error instanceof Error
                    ? resumeListQuery.error.message
                    : isKorean
                      ? "이력서 목록을 불러오지 못했습니다."
                      : "The resume list could not be loaded."
                }
                details={getErrorDetails(resumeListQuery.error)}
                onAction={() => {
                  void resumeListQuery.refetch();
                }}
                title={isKorean ? "이력서를 불러올 수 없습니다" : "Unable to load resumes"}
              />
            ) : null}

            {!resumeListQuery.isLoading && !resumeListQuery.isError && resumeListQuery.data && resumeListQuery.data.items.length === 0 ? (
              <EmptyStateCard
                action={{
                  label: isKorean ? "프로필로 돌아가기" : "Back to profile",
                  to: routeConfig.profile.buildPath(),
                }}
                body={isKorean ? "버전을 연결하려면 첫 이력서를 먼저 만드세요." : "Create your first resume to start attaching versions."}
                title={isKorean ? "이력서가 아직 없습니다" : "No resumes yet"}
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
                        <p className="section-heading__eyebrow">{isKorean ? "선택한 이력서" : "Selected resume"}</p>
                        <h2 className="page-card__title">
                          {resumeListQuery.data.items.find((resume) => resume.id === selectedResumeId)?.title ?? (isKorean ? "이력서" : "Resume")}
                        </h2>
                      </div>
                    </div>
                    <p className="page-card__body">
                      {isKorean
                        ? "이 이력서 컨테이너에는 아직 업로드된 버전이 없습니다. 스킬, 경험, 리스크 파싱을 시작하려면 PDF를 업로드하세요."
                        : "This resume container has no uploaded versions yet. Upload a PDF to start parsing skills, experiences, and risks."}
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
                        {isKorean ? "첫 PDF 버전 업로드" : "Upload first PDF version"}
                      </label>
                    </div>
                  </section>
                ) : null}

                {selectedVersionId ? (
                  selectedVersionQuery.isLoading ? (
                    <LoadingStateCard
                      body={isKorean ? "버전 메타데이터와 파싱 진행 상태를 불러오는 중입니다." : "Loading version metadata and parsing progress."}
                      title={isKorean ? "선택된 버전 준비 중" : "Preparing selected version"}
                    />
                  ) : selectedVersionQuery.isError ? (
                    <ErrorStateCard
                      body={
                        selectedVersionQuery.error instanceof Error
                          ? selectedVersionQuery.error.message
                          : isKorean
                            ? "선택한 이력서 버전을 불러오지 못했습니다."
                            : "The selected resume version could not be loaded."
                      }
                      details={getErrorDetails(selectedVersionQuery.error)}
                      onAction={() => {
                        void selectedVersionQuery.refetch();
                      }}
                      title={isKorean ? "이력서 버전을 불러올 수 없습니다" : "Unable to load resume version"}
                    />
                  ) : selectedVersionQuery.data ? (
                    <section className="page-card">
                      <div className="section-heading">
                        <div>
                          <p className="section-heading__eyebrow">{isKorean ? "선택된 버전" : "Selected version"}</p>
                          <h2 className="page-card__title">{selectedVersionQuery.data.fileNameLabel}</h2>
                        </div>
                        <div className="resume-status-badges">
                          {selectedVersionQuery.data.isActive ? (
                            <span className="question-status-badge question-status-badge--positive">{isKorean ? "활성 버전" : "Active version"}</span>
                          ) : null}
                          <span className={`question-status-badge question-status-badge--${selectedVersionQuery.data.parsingTone}`}>
                            {isKorean ? "파싱" : "Parsing"}: {selectedVersionQuery.data.parsingStatusLabel}
                          </span>
                          <span className={`question-status-badge question-status-badge--${selectedVersionQuery.data.extractionTone}`}>
                            {isKorean ? "추출" : "Extraction"}: {selectedVersionQuery.data.extractionStatusLabel}
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
                            {pendingUploadResumeId === selectedResumeId
                              ? (isKorean ? "업로드 중..." : "Uploading...")
                              : (isKorean ? "대체 PDF 업로드" : "Upload replacement PDF")}
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
                          {pendingDownloadId === selectedVersionQuery.data.id
                            ? (isKorean ? "다운로드 중..." : "Downloading...")
                            : (isKorean ? "PDF 다운로드" : "Download PDF")}
                        </button>
                      </div>
                      <div className="stats-grid">
                        <article className="stat-tile">
                          <p className="stat-tile__label">{isKorean ? "업로드" : "Uploaded"}</p>
                          <strong className="stat-tile__value stat-tile__value--small">
                            {selectedVersionQuery.data.uploadedAtLabel ?? (isKorean ? "알 수 없음" : "Unknown")}
                          </strong>
                        </article>
                        <article className="stat-tile">
                          <p className="stat-tile__label">{isKorean ? "파일" : "File"}</p>
                          <strong className="stat-tile__value stat-tile__value--small">
                            {selectedVersionQuery.data.fileSizeLabel ??
                              selectedVersionQuery.data.fileTypeLabel ??
                              (isKorean ? "알 수 없음" : "Unknown")}
                          </strong>
                        </article>
                        <article className="stat-tile">
                          <p className="stat-tile__label">{isKorean ? "파싱 시작" : "Parsing started"}</p>
                          <strong className="stat-tile__value stat-tile__value--small">
                            {selectedVersionQuery.data.parseStartedAtLabel ?? (isKorean ? "대기 중" : "Waiting")}
                          </strong>
                        </article>
                        <article className="stat-tile">
                          <p className="stat-tile__label">{isKorean ? "파싱 완료" : "Parsing finished"}</p>
                          <strong className="stat-tile__value stat-tile__value--small">
                            {selectedVersionQuery.data.parseCompletedAtLabel ?? (isKorean ? "미완료" : "Not finished")}
                          </strong>
                        </article>
                        <article className="stat-tile">
                          <p className="stat-tile__label">{isKorean ? "추출 시작" : "Extraction started"}</p>
                          <strong className="stat-tile__value stat-tile__value--small">
                            {selectedExtractionQuery.data?.startedAtLabel ??
                              selectedVersionQuery.data.extractionStartedAtLabel ??
                              (isKorean ? "대기 중" : "Waiting")}
                          </strong>
                        </article>
                        <article className="stat-tile">
                          <p className="stat-tile__label">{isKorean ? "추출 완료" : "Extraction finished"}</p>
                          <strong className="stat-tile__value stat-tile__value--small">
                            {selectedExtractionQuery.data?.completedAtLabel ??
                              selectedVersionQuery.data.extractionCompletedAtLabel ??
                              (isKorean ? "미완료" : "Not finished")}
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
                          message={
                            isKorean
                              ? "파싱이 아직 진행 중입니다. 상태가 바뀔 때까지 페이지가 계속 새로고침됩니다."
                              : "Parsing is still in progress. The page will keep refreshing until the status changes."
                          }
                          tone="info"
                        />
                      ) : null}
                      {selectedExtractionQuery.isLoading && selectedVersionQuery.data.parsingStatus === "completed" ? (
                        <FeedbackNotice
                          message={isKorean ? "구조화 추출 상태를 불러오는 중입니다." : "Structured extraction status is loading."}
                          tone="info"
                        />
                      ) : null}
                      {selectedExtractionQuery.data?.extractionStatus === "pending" ||
                      selectedExtractionQuery.data?.extractionStatus === "processing" ? (
                        <FeedbackNotice
                          message={
                            isKorean
                              ? "구조화 추출이 아직 진행 중입니다. 상태가 바뀌면 파싱된 스냅샷이 표시됩니다."
                              : "Structured extraction is still running. Parsed snapshots will appear after the status changes."
                          }
                          tone="info"
                        />
                      ) : null}
                      {selectedExtractionQuery.data?.extractionStatus === "skipped" ? (
                        <div className="resume-version-feedback">
                          <FeedbackNotice
                            message={
                              isKorean
                                ? "구조화 추출이 건너뛰어졌습니다. 이 이력서 버전은 계속 사용할 수 있으며, 가능한 스냅샷은 아래에 표시됩니다."
                                : "Structured extraction was skipped. This resume version remains usable, and any available snapshots are still shown below."
                            }
                            tone="info"
                          />
                        </div>
                      ) : null}
                      {selectedExtractionQuery.data?.extractionStatus === "fallback" ? (
                        <FeedbackNotice
                          message={
                            isKorean
                              ? "결정론적 fallback 추출이 사용되었습니다. 이 이력서 버전은 인터뷰 컨텍스트에 계속 사용할 수 있습니다."
                              : "Deterministic fallback extraction was used. This resume version remains usable for interview context."
                          }
                          tone="info"
                        />
                      ) : null}
                      {selectedExtractionQuery.isError ? (
                        <FeedbackNotice
                          message={
                            selectedExtractionQuery.error instanceof Error
                              ? selectedExtractionQuery.error.message
                              : isKorean
                                ? "구조화 추출 상태를 불러오지 못했습니다."
                                : "Structured extraction status could not be loaded."
                          }
                          details={getErrorDetails(selectedExtractionQuery.error)}
                          tone="error"
                        />
                      ) : null}
                      <section className="page-card page-card--muted">
                        <div className="section-heading">
                          <div>
                            <p className="section-heading__eyebrow">{isKorean ? "구조화 추출" : "Structured extraction"}</p>
                            <h3 className="page-card__title">{isKorean ? "추출 상태와 메타데이터" : "Extraction status and metadata"}</h3>
                          </div>
                        </div>
                        <div className="stats-grid">
                          <article className="stat-tile">
                            <p className="stat-tile__label">{isKorean ? "원본 파싱" : "Raw parsing"}</p>
                            <strong className="stat-tile__value stat-tile__value--small">
                              {selectedExtractionQuery.data?.rawParsingStatusLabel ?? selectedVersionQuery.data.parsingStatusLabel}
                            </strong>
                          </article>
                          <article className="stat-tile">
                            <p className="stat-tile__label">{isKorean ? "구조화 추출" : "Structured extraction"}</p>
                            <strong className="stat-tile__value stat-tile__value--small">
                              {selectedExtractionQuery.data?.extractionStatusLabel ?? selectedVersionQuery.data.extractionStatusLabel}
                            </strong>
                          </article>
                          <article className="stat-tile">
                            <p className="stat-tile__label">{isKorean ? "모델" : "Model"}</p>
                            <strong className="stat-tile__value stat-tile__value--small">
                              {selectedExtractionQuery.data?.modelLabel ??
                                selectedVersionQuery.data.extractionModelLabel ??
                                (isKorean ? "정보 없음" : "Not available")}
                            </strong>
                          </article>
                          <article className="stat-tile">
                            <p className="stat-tile__label">{isKorean ? "프롬프트 버전" : "Prompt version"}</p>
                            <strong className="stat-tile__value stat-tile__value--small">
                              {selectedExtractionQuery.data?.promptVersionLabel ??
                                selectedVersionQuery.data.extractionPromptVersion ??
                                (isKorean ? "정보 없음" : "Not available")}
                            </strong>
                          </article>
                          <article className="stat-tile">
                            <p className="stat-tile__label">{isKorean ? "신뢰도" : "Confidence"}</p>
                            <strong className="stat-tile__value stat-tile__value--small">
                              {selectedVersionQuery.data.extractionConfidenceLabel ?? (isKorean ? "정보 없음" : "Not available")}
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
                                ? isKorean
                                  ? "추출 재실행 중..."
                                  : "Re-running extraction..."
                                : isKorean
                                  ? "추출 다시 실행"
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
                                {isKorean ? "상태 다시 확인" : "Retry status check"}
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </section>
                      <section className="resume-version-activation-panel">
                        <div>
                          <p className="section-heading__eyebrow">{isKorean ? "인터뷰 컨텍스트" : "Interview context"}</p>
                          <h3 className="page-card__title">{isKorean ? "이 버전을 답변 평가에 사용" : "Use this version for answer evaluation"}</h3>
                          <p className="page-card__body">
                            {selectedVersionQuery.data.isActive
                              ? isKorean
                                ? "이 이력서 버전은 이미 활성 상태입니다. 새 답변과 이력서 기반 추천에 이 버전이 사용됩니다."
                                : "This resume version is already active. New answers and resume-driven recommendations will use it."
                              : selectedVersionQuery.data.canActivate
                                ? isKorean
                                  ? "이 파싱된 버전을 활성화하면 질문 매칭, 답변 평가, 이력서 인텔리전스에 사용됩니다."
                                  : "Activate this parsed version to drive question matching, answer evaluation, and resume intelligence."
                                : selectedVersionQuery.data.parsingStatus === "failed"
                                  ? isKorean
                                    ? "파싱에 성공한 버전을 다시 업로드하기 전까지 이 버전은 활성화할 수 없습니다."
                                    : "This version cannot become active until you upload a version that parses successfully."
                                  : isKorean
                                    ? "파싱이 정상적으로 끝나면 활성화할 수 있습니다."
                                    : "Activation becomes available after parsing completes successfully."}
                          </p>
                        </div>
                        <div className="resume-version-activation-panel__summary">
                          <article className="resume-version-activation-panel__summary-item">
                            <span>{isKorean ? "활성화 상태" : "Activation state"}</span>
                            <strong>
                              {selectedVersionQuery.data.isActive
                                ? isKorean
                                  ? "이미 인터뷰 평가에 사용 중"
                                  : "Already driving interview evaluation"
                                : selectedVersionQuery.data.canActivate
                                  ? isKorean
                                    ? "활성 인터뷰 컨텍스트로 전환 가능"
                                    : "Ready to become the active interview context"
                                  : isKorean
                                    ? "파싱이 정상 완료될 때까지 대기"
                                    : "Blocked until parsing completes cleanly"}
                            </strong>
                          </article>
                          <article className="resume-version-activation-panel__summary-item">
                            <span>{isKorean ? "활성화 전 확인" : "Before activate"}</span>
                            <strong>
                              {isKorean
                                ? "파싱, 추출, 그리고 실제로 방어할 근거 섹션을 먼저 확인하세요."
                                : "Confirm parsing, extraction, and the evidence sections you expect to defend"}
                            </strong>
                          </article>
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
                              ? isKorean
                                ? "활성 버전"
                                : "Active version"
                              : pendingActivationId === selectedVersionQuery.data.id
                                ? isKorean
                                  ? "활성화 중..."
                                  : "Activating..."
                                : isKorean
                                  ? "인터뷰 컨텍스트로 활성화"
                                  : "Activate for interview context"}
                          </button>
                          <Link className="secondary-button" to={routeConfig.resumeAnalysis.buildPath()}>
                            {isKorean ? "이력서 분석 열기" : "Open resume analysis"}
                          </Link>
                          <Link
                            className="secondary-button"
                            to={routeConfig.resumeEditor.buildPath({
                              versionId: selectedVersionQuery.data.id,
                            })}
                          >
                            {isKorean ? "이력서 에디터 열기" : "Open resume editor"}
                          </Link>
                          <Link
                            className="secondary-button"
                            to={routeConfig.resumeHeatmap.buildPath({
                              versionId: selectedVersionQuery.data.id,
                            })}
                          >
                            {isKorean ? "인터뷰 히트맵 열기" : "Open interview heatmap"}
                          </Link>
                        </div>
                      </section>
                    </section>
                  ) : null
                ) : null}

                {selectedVersionQuery.data?.parsingStatus === "completed" ? (
                  !canLoadSnapshots ? (
                    <LoadingStateCard
                      body={
                        isKorean
                          ? "구조화 추출 상태가 안정되면 버전 스냅샷을 불러옵니다."
                          : "Waiting for structured extraction to settle before loading version snapshots."
                      }
                      title={isKorean ? "이력서 상세 준비 중" : "Preparing resume details"}
                    />
                  ) : snapshotsQuery.isLoading ? (
                    <LoadingStateCard
                      body={
                        isKorean
                          ? "추출된 프로필, 연락처, 역량, 스킬, 경력, 프로젝트, 성과, 자격, 리스크를 불러오는 중입니다."
                          : "Loading extracted profile, contacts, competencies, skills, experience, projects, achievements, credentials, and risks."
                      }
                      title={isKorean ? "파싱된 이력서 상세 준비 중" : "Preparing parsed resume details"}
                    />
                  ) : snapshotsQuery.isError ? (
                    selectedExtractionQuery.data?.extractionStatus === "failed" ? (
                      <FeedbackNotice
                        details={getErrorDetails(snapshotsQuery.error)}
                        message={
                          snapshotsQuery.error instanceof Error
                            ? snapshotsQuery.error.message
                            : isKorean
                              ? "구조화 추출에 실패했고 사용할 수 있는 스냅샷 섹션이 없습니다."
                              : "Structured extraction failed and no snapshot sections were available."
                        }
                        tone="info"
                      />
                    ) : (
                      <ErrorStateCard
                        body={
                          snapshotsQuery.error instanceof Error
                            ? snapshotsQuery.error.message
                            : isKorean
                              ? "파싱된 이력서 상세를 불러오지 못했습니다."
                              : "The parsed resume details could not be loaded."
                        }
                        details={getErrorDetails(snapshotsQuery.error)}
                        onAction={() => {
                          void snapshotsQuery.refetch();
                        }}
                        title={isKorean ? "파싱된 이력서 상세를 불러올 수 없습니다" : "Unable to load parsed resume details"}
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
                          emptyMessage={isKorean ? "아직 이 버전의 학력 정보가 없습니다." : "No education entries are available for this version yet."}
                          eyebrow={isKorean ? "학력" : "Education"}
                          items={snapshotsQuery.data.education.map((item) => ({
                            id: item.id,
                            title: [item.institutionName, item.degreeName].filter(Boolean).join(" · ") || item.institutionName,
                            meta: [item.fieldOfStudy, item.dateLabel].filter(
                              (value): value is string => Boolean(value),
                            ),
                            body: item.description,
                          }))}
                          sectionId="resume-section-education"
                          title={isKorean ? "학력 이력" : "Education history"}
                        />
                        <ResumeCredentialSection
                          emptyMessage={isKorean ? "아직 이 버전의 자격증 정보가 없습니다." : "No certification entries are available for this version yet."}
                          eyebrow={isKorean ? "자격증" : "Certifications"}
                          items={snapshotsQuery.data.certifications.map((item) => ({
                            id: item.id,
                            title: item.name,
                            meta: [item.issuerName, item.credentialCode, item.dateLabel, item.scoreText].filter(
                              (value): value is string => Boolean(value),
                            ),
                          }))}
                          sectionId="resume-section-certifications"
                          title={isKorean ? "자격증 및 자격 근거" : "Certifications and credential evidence"}
                        />
                        <ResumeCredentialSection
                          emptyMessage={isKorean ? "아직 이 버전의 수상 정보가 없습니다." : "No award entries are available for this version yet."}
                          eyebrow={isKorean ? "수상" : "Awards"}
                          items={snapshotsQuery.data.awards.map((item) => ({
                            id: item.id,
                            title: item.title,
                            meta: [item.issuerName, item.awardedOnLabel].filter(
                              (value): value is string => Boolean(value),
                            ),
                            body: item.description,
                          }))}
                          sectionId="resume-section-awards"
                          title={isKorean ? "수상 및 인정 내역" : "Awards and recognitions"}
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
            {isOutlineOpen ? (isKorean ? "개요 숨기기" : "Hide outline") : (isKorean ? "개요" : "Outline")}
          </button>
          {isOutlineOpen ? (
            <aside className="page-card page-card--muted resume-floating-outline__panel">
              <div className="section-heading">
                <div>
                  <span className="page-card__label">{isKorean ? "개요" : "Outline"}</span>
                  <h3 className="page-card__title">{isKorean ? "이력서 섹션으로 바로 이동" : "Jump to a resume section"}</h3>
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
