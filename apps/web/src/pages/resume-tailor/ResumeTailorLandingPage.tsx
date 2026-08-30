import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getResumeVersionChoices } from "../../entities/resume/model";
import { useResumeAnalysesQuery } from "../../features/resume-tailor/api/useResumeAnalysesQuery";
import { useJobPostingsQuery } from "../../features/resume-tailor/api/useJobPostingsQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { useLocale } from "../../shared/i18n";

export function ResumeTailorLandingPage() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const resumeListQuery = useResumeListQuery();
  const jobPostingsQuery = useJobPostingsQuery();
  const resumeChoices = useMemo(
    () => getResumeVersionChoices(resumeListQuery.data),
    [resumeListQuery.data],
  );
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");

  useEffect(() => {
    if (!selectedVersionId && resumeChoices.length > 0) {
      setSelectedVersionId(
        resumeChoices.find((choice) => choice.isActive)?.versionId ?? resumeChoices[0].versionId,
      );
    }
  }, [resumeChoices, selectedVersionId]);

  const analysesQuery = useResumeAnalysesQuery(selectedVersionId || null, Boolean(selectedVersionId));

  return (
    <PageContainer
      description={isKorean ? "소스 이력서를 고르고 회사 컨텍스트를 연결한 뒤, 특정 직무에 맞춘 이력서 분석으로 이동하세요." : "Choose the source resume, connect company context, and move into one tailoring analysis that hardens the resume for a specific role."}
      eyebrow={isKorean ? "맞춤 흐름" : "Tailor flow"}
      title={isKorean ? "직무별 기준 문서 흐름 시작" : "Start the role-specific source-of-truth flow"}
    >
      {resumeListQuery.isLoading ? (
        <LoadingStateCard
          body={isKorean ? "맞춤 작업공간을 열기 전에 저장된 이력서 버전을 불러오는 중입니다." : "Loading saved resume versions before opening the tailoring workspace."}
          title={isKorean ? "이력서 맞춤 준비 중" : "Preparing resume tailoring"}
        />
      ) : null}

      {resumeListQuery.isError ? (
        <ErrorStateCard
          body={
            resumeListQuery.error instanceof Error
              ? resumeListQuery.error.message
              : isKorean ? "이력서 버전을 불러오지 못했습니다." : "Resume versions could not be loaded."
          }
          details={getErrorDetails(resumeListQuery.error)}
          onAction={() => {
            void resumeListQuery.refetch();
          }}
          title={isKorean ? "이력서 맞춤 작업공간을 불러올 수 없습니다" : "Unable to load resume tailoring workspace"}
        />
      ) : null}

      {!resumeListQuery.isLoading && !resumeListQuery.isError ? (
        <div className="page-stack">
          <section className="page-card resume-tailor-workspace-surface">
            <div className="resume-tailor-workspace-surface__header">
              <div className="resume-tailor-workspace-surface__intro">
                <div className="resume-tailor-workspace-surface__eyebrow-row">
                  <span className="page-card__label">{isKorean ? "맞춤 허브" : "Tailor hub"}</span>
                  <span className="question-status-badge question-status-badge--accent">{isKorean ? "4단계 중 1단계" : "Step 1 of 4"}</span>
                </div>
                <p className="resume-tailor-workspace-surface__breadcrumbs">
                  {isKorean ? "소스 이력서" : "Source resume"}
                  <span>/</span>
                  {isKorean ? "목표 회사" : "Target company"}
                  <span>/</span>
                  {isKorean ? "맞춤 분석" : "Tailor analysis"}
                </p>
                <h2 className="resume-tailor-workspace-surface__title">{isKorean ? "변경하지 않는 이력서 버전 하나를 고른 뒤 실제 직무 하나에 맞춰 다듬으세요" : "Choose one immutable resume version, then tailor it toward one real role"}</h2>
                <p className="resume-tailor-workspace-surface__body">
                  {isKorean ? "맞춤 작업은 직무별 기준 문서 강화 과정으로 다뤄야 합니다. 원본 이력서는 바뀌지 않고, 분석 결과와 수락한 수정안, 내보내기 결과가 선택한 버전 위에 쌓입니다." : "Treat tailoring as role-specific source-of-truth hardening. The original resume stays unchanged while analyses, accepted rewrites, and exports accumulate on top of one selected version."}
                </p>
              </div>
              <div className="resume-tailor-workspace-surface__stats">
                <article className="resume-tailor-workspace-surface__stat">
                  <span>{isKorean ? "이력서 버전" : "Resume versions"}</span>
                  <strong>{resumeChoices.length}</strong>
                </article>
                <article className="resume-tailor-workspace-surface__stat">
                  <span>{isKorean ? "저장된 공고" : "Saved postings"}</span>
                  <strong>{jobPostingsQuery.data?.length ?? 0}</strong>
                </article>
                <article className="resume-tailor-workspace-surface__stat">
                  <span>{isKorean ? "분석" : "Analyses"}</span>
                  <strong>{analysesQuery.data?.length ?? 0}</strong>
                </article>
              </div>
            </div>
            <div className="resume-tailor-workspace-surface__guidance" aria-label={isKorean ? "맞춤 허브 가이드" : "Tailor hub guidance"}>
              <article className="resume-tailor-workspace-surface__guidance-card">
                <span>{isKorean ? "버전 원칙" : "Version rule"}</span>
                <strong>{isKorean ? "새 문서 복사본이 아니라 방어 가능한 소스 이력서 하나에서 시작하세요." : "Start from one defendable source resume, not a fresh document copy."}</strong>
              </article>
              <article className="resume-tailor-workspace-surface__guidance-card">
                <span>{isKorean ? "컨텍스트 원칙" : "Context rule"}</span>
                <strong>{isKorean ? "또 다른 일반 분석을 만들기 전에 회사 컨텍스트를 먼저 고르세요." : "Pick company context before generating another generic analysis."}</strong>
              </article>
              <article className="resume-tailor-workspace-surface__guidance-card">
                <span>{isKorean ? "이탈 조건" : "Exit rule"}</span>
                <strong>{isKorean ? "버전 하나와 목표 직무 하나가 분명해질 때만 다음으로 진행하세요." : "Move forward only when one version and one target role are obvious."}</strong>
              </article>
            </div>
            <div className="resume-tailor-workspace-surface__chips">
              <span className="detail-chip">{isKorean ? "원본 이력서 유지" : "Original source preserved"}</span>
              <span className="detail-chip detail-chip--accent">{isKorean ? "직무 맞춤 흐름" : "Role-specific flow"}</span>
              <span className="detail-chip">{isKorean ? "내보내기 경로 포함" : "Export path included"}</span>
            </div>
            <div className="page-card__actions">
              {selectedVersionId ? (
                <Link
                  className="primary-button"
                  to={routeConfig.resumeTailorAnalysisList.buildPath({ versionId: selectedVersionId })}
                >
                  {isKorean ? "분석 만들기" : "Create analysis"}
                </Link>
              ) : null}
              <Link className="secondary-button" to={routeConfig.resumeTailorJobPostings.buildPath()}>
                {isKorean ? "채용 공고 관리" : "Manage job postings"}
              </Link>
            </div>
          </section>

          {resumeChoices.length === 0 ? (
            <EmptyStateCard
              action={{ label: isKorean ? "이력서 관리 열기" : "Open resume management", to: routeConfig.resume.buildPath() }}
              body={isKorean ? "맞춤 분석을 만들기 전에 이력서 버전을 최소 하나 이상 업로드하고 파싱하세요." : "Upload and parse at least one resume version before creating a tailoring analysis."}
              title={isKorean ? "사용 가능한 이력서 버전이 없습니다" : "No resume versions available"}
            />
          ) : (
            <>
              <section className="page-card">
                <span className="page-card__label">{isKorean ? "버전" : "Version"}</span>
                <h2 className="page-card__title">
                  {isKorean ? "이 흐름의 기준이 될 이력서 버전을 고르세요" : "Choose the source resume version for this flow"}
                </h2>
                <label className="form-field">
                  <span className="form-field__label">{isKorean ? "이력서 버전" : "Resume version"}</span>
                  <select
                    className="form-input"
                    onChange={(event) => setSelectedVersionId(event.target.value)}
                    value={selectedVersionId}
                  >
                    {resumeChoices.map((choice) => (
                      <option key={choice.versionId} value={choice.versionId}>
                        {choice.resumeTitle} · {choice.versionNumberLabel}
                        {choice.isActive ? (isKorean ? " · 활성" : " · Active") : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </section>

              <section className="page-card">
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">{isKorean ? "분석" : "Analyses"}</p>
                    <h2 className="page-card__title">
                      {isKorean ? "이 버전의 최근 직무별 분석" : "Recent role-specific analyses for this version"}
                    </h2>
                  </div>
                  <span className="section-heading__count">{analysesQuery.data?.length ?? 0}</span>
                </div>
                {analysesQuery.isLoading ? (
                  <LoadingStateCard
                    body={
                      isKorean
                        ? "선택한 버전에 저장된 이력서 맞춤 분석을 불러오는 중입니다."
                        : "Loading persisted resume-tailoring runs for the selected version."
                    }
                    title={isKorean ? "분석 불러오는 중" : "Loading analyses"}
                  />
                ) : analysesQuery.isError ? (
                  <ErrorStateCard
                    body={
                      analysesQuery.error instanceof Error
                        ? analysesQuery.error.message
                        : isKorean
                          ? "이력서 분석을 불러오지 못했습니다."
                          : "Resume analyses could not be loaded."
                    }
                    details={getErrorDetails(analysesQuery.error)}
                    onAction={() => {
                      void analysesQuery.refetch();
                    }}
                    title={isKorean ? "분석을 불러올 수 없습니다" : "Unable to load analyses"}
                  />
                ) : analysesQuery.data && analysesQuery.data.length > 0 ? (
                  <div className="stack-list">
                    {analysesQuery.data.slice(0, 4).map((analysis) => (
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
                              versionId: selectedVersionId,
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
                    action={{
                      label: isKorean ? "첫 분석 만들기" : "Create first analysis",
                      to: routeConfig.resumeTailorAnalysisList.buildPath({ versionId: selectedVersionId }),
                    }}
                    body={
                      isKorean
                        ? "아직 이 이력서 버전에 대한 맞춤 분석이 없습니다."
                        : "No tailoring runs exist for this resume version yet."
                    }
                    title={isKorean ? "아직 분석이 없습니다" : "No analyses yet"}
                  />
                )}
              </section>

              <section className="page-card">
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">{isKorean ? "채용 공고" : "Job Postings"}</p>
                    <h2 className="page-card__title">
                      {isKorean ? "다음 분석을 이끌 수 있는 저장된 목표 직무" : "Saved target roles that can drive the next analysis"}
                    </h2>
                  </div>
                  <span className="section-heading__count">{jobPostingsQuery.data?.length ?? 0}</span>
                </div>
                {jobPostingsQuery.isLoading ? (
                  <LoadingStateCard
                    body={
                      isKorean
                        ? "맞춤 분석에 다시 사용할 저장된 채용 공고를 불러오는 중입니다."
                        : "Loading saved job postings for reuse in tailoring analyses."
                    }
                    title={isKorean ? "채용 공고 불러오는 중" : "Loading job postings"}
                  />
                ) : jobPostingsQuery.isError ? (
                  <ErrorStateCard
                    body={
                      jobPostingsQuery.error instanceof Error
                        ? jobPostingsQuery.error.message
                        : isKorean
                          ? "채용 공고를 불러오지 못했습니다."
                          : "Job postings could not be loaded."
                    }
                    details={getErrorDetails(jobPostingsQuery.error)}
                    onAction={() => {
                      void jobPostingsQuery.refetch();
                    }}
                    title={isKorean ? "채용 공고를 불러올 수 없습니다" : "Unable to load job postings"}
                  />
                ) : jobPostingsQuery.data && jobPostingsQuery.data.length > 0 ? (
                  <div className="stack-list">
                    {jobPostingsQuery.data.slice(0, 3).map((jobPosting) => (
                      <article className="list-item-card" key={jobPosting.id}>
                        <div className="list-item-card__content">
                          <div className="list-item-card__meta">
                            <span>{jobPosting.inputTypeLabel}</span>
                            <span>{jobPosting.fetchStatusLabel}</span>
                            {jobPosting.fetchedTitle ? <span>{jobPosting.fetchedTitle}</span> : null}
                          </div>
                          <h3 className="list-item-card__title">{jobPosting.title}</h3>
                          <p className="list-item-card__body">
                            {jobPosting.parsedSummary ??
                              (isKorean ? "아직 파싱된 요약이 없습니다." : "No parsed summary is available yet.")}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyStateCard
                    action={{
                      label: isKorean ? "채용 공고 추가" : "Add job posting",
                      to: routeConfig.resumeTailorJobPostings.buildPath(),
                    }}
                    body={
                      isKorean
                        ? "직무 인식 분석을 만들기 전에 텍스트나 원본 링크로 채용 공고를 저장하세요."
                        : "Save a job posting from text or a source link before creating job-aware analyses."
                    }
                    title={isKorean ? "아직 채용 공고가 없습니다" : "No job postings yet"}
                  />
                )}
              </section>
            </>
          )}
        </div>
      ) : null}
    </PageContainer>
  );
}
