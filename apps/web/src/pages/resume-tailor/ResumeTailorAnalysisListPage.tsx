import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCreateResumeAnalysisMutation } from "../../features/resume-tailor/api/useCreateResumeAnalysisMutation";
import { useJobPostingsQuery } from "../../features/resume-tailor/api/useJobPostingsQuery";
import { useResumeAnalysesQuery } from "../../features/resume-tailor/api/useResumeAnalysesQuery";
import { useResumeVersionDetailQuery } from "../../features/resume/api/useResumeVersionDetailQuery";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { useLocale } from "../../shared/i18n";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";

export function ResumeTailorAnalysisListPage() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const navigate = useNavigate();
  const { versionId } = useParams<{ versionId: string }>();
  const [jobPostingId, setJobPostingId] = useState("");
  const [preferredFormatType, setPreferredFormatType] = useState("");
  const versionQuery = useResumeVersionDetailQuery(versionId ?? null);
  const analysesQuery = useResumeAnalysesQuery(versionId ?? null);
  const jobPostingsQuery = useJobPostingsQuery();
  const createMutation = useCreateResumeAnalysisMutation(versionId ?? null);

  const selectableJobPostings = useMemo(() => jobPostingsQuery.data ?? [], [jobPostingsQuery.data]);

  async function handleCreateAnalysis() {
    const analysis = await createMutation.mutateAsync({
      jobPostingId: jobPostingId || null,
      preferredFormatType: preferredFormatType.trim() || null,
    });

    navigate(
      routeConfig.resumeTailorAnalysisDetail.buildPath({
        versionId: versionId ?? analysis.resumeVersionId,
        analysisId: analysis.id,
      }),
    );
  }

  return (
    <PageContainer
      description={
        isKorean
          ? "변경되지 않는 이력서 버전 하나에 목표 회사 컨텍스트를 연결한 뒤, 직무별 맞춤 분석을 실행하거나 다시 여세요."
          : "Choose target company context for one immutable resume version, then run or reopen a role-specific tailoring analysis."
      }
      eyebrow={isKorean ? "맞춤 흐름" : "Tailor flow"}
      title={isKorean ? "다음 직무별 분석을 만들거나 다시 여세요" : "Create or reopen the next role-specific analysis"}
    >
      {versionQuery.isLoading ? (
        <LoadingStateCard
          body={isKorean ? "분석 이력을 열기 전에 선택한 이력서 버전을 불러오는 중입니다." : "Loading the selected resume version before opening analysis history."}
          title={isKorean ? "분석 이력 준비 중" : "Preparing analysis history"}
        />
      ) : versionQuery.isError ? (
        <ErrorStateCard
          body={
            versionQuery.error instanceof Error
              ? versionQuery.error.message
              : isKorean
                ? "이력서 버전을 불러오지 못했습니다."
                : "The resume version could not be loaded."
          }
          details={getErrorDetails(versionQuery.error)}
          onAction={() => {
            void versionQuery.refetch();
          }}
          title={isKorean ? "이력서 버전을 불러올 수 없습니다" : "Unable to load resume version"}
        />
      ) : versionQuery.data ? (
        <div className="page-stack">
          <section className="page-card resume-tailor-workspace-surface">
            <div className="resume-tailor-workspace-surface__header">
              <div className="resume-tailor-workspace-surface__intro">
                <div className="resume-tailor-workspace-surface__eyebrow-row">
                  <span className="page-card__label">{isKorean ? "분석 큐" : "Analysis queue"}</span>
                  <span className="question-status-badge question-status-badge--accent">{isKorean ? "4단계 중 3단계" : "Step 3 of 4"}</span>
                </div>
                <p className="resume-tailor-workspace-surface__breadcrumbs">
                  {isKorean ? "소스 이력서" : "Source resume"}
                  <span>/</span>
                  {isKorean ? "목표 직무" : "Target role"}
                  <span>/</span>
                  {isKorean ? "맞춤 분석" : "Tailor analysis"}
                </p>
                <h2 className="resume-tailor-workspace-surface__title">{isKorean ? "직무 인식 분석 하나를 만들거나 가장 적절한 기존 실행을 다시 여세요" : "Create one job-aware analysis or reopen the best existing run"}</h2>
                <p className="resume-tailor-workspace-surface__body">
                  {isKorean
                    ? "모든 분석은 이 변경되지 않는 소스 버전 위에 쌓입니다. 목표는 많은 실행을 만드는 것이 아니라, 이력서를 가장 선명하게 다듬는 회사 컨텍스트 하나를 고르는 것입니다."
                    : "Every analysis stays layered on top of this immutable source version. The goal here is not to spawn many runs, but to pick the one company context that most clearly sharpens the resume."}
                </p>
              </div>
              <div className="resume-tailor-workspace-surface__stats">
                <article className="resume-tailor-workspace-surface__stat">
                  <span>{isKorean ? "버전" : "Version"}</span>
                  <strong>{versionQuery.data.versionNumberLabel}</strong>
                </article>
                <article className="resume-tailor-workspace-surface__stat">
                  <span>{isKorean ? "저장된 공고" : "Saved postings"}</span>
                  <strong>{selectableJobPostings.length}</strong>
                </article>
                <article className="resume-tailor-workspace-surface__stat">
                  <span>{isKorean ? "저장된 실행" : "Persisted runs"}</span>
                  <strong>{analysesQuery.data?.length ?? 0}</strong>
                </article>
              </div>
            </div>
            <div className="resume-tailor-workspace-surface__guidance" aria-label={isKorean ? "분석 큐 가이드" : "Analysis queue guidance"}>
              <article className="resume-tailor-workspace-surface__guidance-card">
                <span>{isKorean ? "컨텍스트 원칙" : "Context rule"}</span>
                <strong>{isKorean ? "가장 안전한 공고가 아니라 가장 날카로운 불일치를 드러내는 공고를 고르세요." : "Choose the posting that exposes the sharpest mismatch, not the safest fit."}</strong>
              </article>
              <article className="resume-tailor-workspace-surface__guidance-card">
                <span>{isKorean ? "실행 원칙" : "Run rule"}</span>
                <strong>{isKorean ? "기존 실행이 현재 직무를 더 이상 설명하지 못할 때만 새 분석을 만드세요." : "Create a new analysis only when existing runs no longer answer the current role."}</strong>
              </article>
              <article className="resume-tailor-workspace-surface__guidance-card">
                <span>{isKorean ? "이탈 조건" : "Exit rule"}</span>
                <strong>{isKorean ? "수정 제안을 수락하거나 거절할 가치가 있는 실행 하나가 보이면 상세 화면으로 이동하세요." : "Move to the detail workspace once one run is worth accepting or rejecting suggestions in."}</strong>
              </article>
            </div>
            <div className="resume-tailor-workspace-surface__chips">
              <span className="detail-chip">{isKorean ? `파싱 ${versionQuery.data.parsingStatusLabel}` : `Parsing ${versionQuery.data.parsingStatusLabel}`}</span>
              {versionQuery.data.extractionStatusLabel ? (
                <span className="detail-chip detail-chip--accent">
                  {isKorean ? `추출 ${versionQuery.data.extractionStatusLabel}` : `Extraction ${versionQuery.data.extractionStatusLabel}`}
                </span>
              ) : null}
            </div>
          </section>

          <section className="page-card">
            <span className="page-card__label">{isKorean ? "생성" : "Create"}</span>
            <h2 className="page-card__title">{isKorean ? "직무별 맞춤 분석 하나를 만드세요" : "Create one role-specific tailoring analysis"}</h2>
            <div className="form-grid">
              <label className="form-field">
                <span className="form-field__label">{isKorean ? "저장된 채용 공고" : "Saved job posting"}</span>
                <select
                  className="form-input"
                  onChange={(event) => setJobPostingId(event.target.value)}
                  value={jobPostingId}
                >
                  <option value="">{isKorean ? "없음" : "None"}</option>
                  {selectableJobPostings.map((jobPosting) => (
                    <option key={jobPosting.id} value={jobPosting.id}>
                      {jobPosting.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span className="form-field__label">{isKorean ? "선호 포맷 유형" : "Preferred format type"}</span>
                <input
                  className="form-input"
                  onChange={(event) => setPreferredFormatType(event.target.value)}
                  placeholder={isKorean ? "선택 사항, 예: technical_focused" : "Optional, for example technical_focused"}
                  type="text"
                  value={preferredFormatType}
                />
              </label>
            </div>
            {createMutation.isError ? (
              <ErrorStateCard
                body={
                  createMutation.error instanceof Error
                    ? createMutation.error.message
                    : isKorean
                      ? "분석을 만들지 못했습니다."
                      : "The analysis could not be created."
                }
                details={getErrorDetails(createMutation.error)}
                onAction={() => createMutation.reset()}
                title={isKorean ? "분석을 만들 수 없습니다" : "Unable to create analysis"}
              />
            ) : null}
            <div className="page-card__actions">
              <button
                className="primary-button"
                disabled={createMutation.isPending}
                onClick={() => {
                  void handleCreateAnalysis();
                }}
                type="button"
              >
                {createMutation.isPending ? (isKorean ? "생성 중..." : "Creating...") : isKorean ? "분석 실행" : "Run analysis"}
              </button>
              <Link className="secondary-button" to={routeConfig.resumeTailorJobPostings.buildPath()}>
                {isKorean ? "채용 공고 관리" : "Manage job postings"}
              </Link>
            </div>
          </section>

          <section className="page-card">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">{isKorean ? "이력" : "History"}</p>
                <h2 className="page-card__title">{isKorean ? "이 소스 버전에 저장된 분석" : "Persisted analyses for this source version"}</h2>
              </div>
              <span className="section-heading__count">{analysesQuery.data?.length ?? 0}</span>
            </div>
            {analysesQuery.isLoading ? (
              <LoadingStateCard
                body={isKorean ? "이 이력서 버전의 이전 맞춤 분석을 불러오는 중입니다." : "Loading older tailoring runs for this resume version."}
                title={isKorean ? "분석 불러오는 중" : "Loading analyses"}
              />
            ) : analysesQuery.isError ? (
              <ErrorStateCard
                body={
                  analysesQuery.error instanceof Error
                    ? analysesQuery.error.message
                    : isKorean
                      ? "분석을 불러오지 못했습니다."
                      : "Analyses could not be loaded."
                }
                details={getErrorDetails(analysesQuery.error)}
                onAction={() => {
                  void analysesQuery.refetch();
                }}
                title={isKorean ? "분석을 불러올 수 없습니다" : "Unable to load analyses"}
              />
            ) : analysesQuery.data && analysesQuery.data.length > 0 ? (
              <div className="stack-list">
                {analysesQuery.data.map((analysis) => (
                  <article className="list-item-card" key={analysis.id}>
                    <div className="list-item-card__content">
                      <div className="list-item-card__meta">
                        <span>{analysis.statusLabel}</span>
                        <span>{analysis.generationSourceLabel}</span>
                        {analysis.createdAtLabel ? <span>{analysis.createdAtLabel}</span> : null}
                      </div>
                      <h3 className="list-item-card__title">
                        {analysis.suggestedHeadline ?? analysis.recommendedFormatTypeLabel}
                      </h3>
                      <p className="list-item-card__body">{analysis.matchSummary}</p>
                    </div>
                    <div className="list-item-card__actions">
                      <span className="detail-chip detail-chip--accent">
                        {isKorean ? `점수 ${analysis.overallScoreLabel}` : `Score ${analysis.overallScoreLabel}`}
                      </span>
                      <Link
                        className="secondary-button"
                        to={routeConfig.resumeTailorAnalysisDetail.buildPath({
                          versionId: versionId ?? analysis.resumeVersionId,
                          analysisId: analysis.id,
                        })}
                      >
                        {isKorean ? "작업공간 열기" : "Open workspace"}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyStateCard
                body={isKorean ? "아직 이 이력서 버전에 대한 맞춤 분석이 없습니다. 위 폼에서 첫 분석을 만드세요." : "No tailoring runs exist for this resume version yet. Create the first one from the form above."}
                title={isKorean ? "아직 분석이 없습니다" : "No analyses yet"}
              />
            )}
          </section>
        </div>
      ) : null}
    </PageContainer>
  );
}
