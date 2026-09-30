import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useJobPostingDetailQuery } from "../../features/resume-tailor/api/useJobPostingDetailQuery";
import { useCreateResumeAnalysisExportMutation } from "../../features/resume-tailor/api/useCreateResumeAnalysisExportMutation";
import { useResumeAnalysisDetailQuery } from "../../features/resume-tailor/api/useResumeAnalysisDetailQuery";
import { useResumeAnalysisExportsQuery } from "../../features/resume-tailor/api/useResumeAnalysisExportsQuery";
import { useToggleResumeAnalysisSuggestionMutation } from "../../features/resume-tailor/api/useToggleResumeAnalysisSuggestionMutation";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { downloadResumeAnalysisExportFileRequest } from "../../shared/api/resumeTailorApi";
import { getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { useLocale } from "../../shared/i18n";
import { ResumeExperienceTimeline, ResumeProfileCard, ResumeProjectsCard, ResumeSkillsCard } from "../../widgets/resume";

export function ResumeTailorAnalysisDetailPage() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const { versionId, analysisId } = useParams<{ versionId: string; analysisId: string }>();
  const [copiedPlainText, setCopiedPlainText] = useState(false);
  const analysisQuery = useResumeAnalysisDetailQuery(versionId ?? null, analysisId ?? null);
  const exportsQuery = useResumeAnalysisExportsQuery(versionId ?? null, analysisId ?? null);
  const snapshotsQuery = useResumeVersionSnapshotsQuery(versionId ?? null);
  const toggleSuggestionMutation = useToggleResumeAnalysisSuggestionMutation(
    versionId ?? null,
    analysisId ?? null,
  );
  const createExportMutation = useCreateResumeAnalysisExportMutation(versionId ?? null, analysisId ?? null);
  const jobPostingDetailQuery = useJobPostingDetailQuery(
    analysisQuery.data?.jobPostingId ?? null,
    Boolean(analysisQuery.data?.jobPostingId),
  );

  async function handleDownloadExport(exportId: string, fileName: string) {
    const blob = await downloadResumeAnalysisExportFileRequest(versionId ?? "", analysisId ?? "", exportId);
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(objectUrl);
  }

  async function handleCopyPlainText() {
    const plainText = analysisQuery.data?.tailoredDocument?.plainText;
    if (!plainText || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(plainText);
    setCopiedPlainText(true);
    window.setTimeout(() => setCopiedPlainText(false), 1500);
  }

  return (
    <PageContainer
      description={isKorean ? "저장된 맞춤 분석을 검토하고, 직무별 스토리를 강화하는 수정안을 수락한 뒤, 다듬어진 미리보기를 내보내세요." : "Review one saved tailoring analysis, accept the rewrites that strengthen the role-specific story, and export the hardened preview."}
      eyebrow={isKorean ? "맞춤 흐름" : "Tailor flow"}
      title={isKorean ? "직무별 수정 경로를 수락하거나 거절하세요" : "Accept or reject the role-specific rewrite path"}
    >
      {analysisQuery.isLoading ? (
        <LoadingStateCard
          body={isKorean ? "저장된 맞춤 분석과 보존된 맞춤 문서를 불러오는 중입니다." : "Loading the saved tailoring analysis and persisted tailored document."}
          title={isKorean ? "맞춤 이력서 작업공간 준비 중" : "Preparing tailored resume workspace"}
        />
      ) : analysisQuery.isError ? (
        <ErrorStateCard
          body={
            userFacingErrorMessage(analysisQuery.error, isKorean ? "이력서 분석을 불러오지 못했습니다." : "The resume analysis could not be loaded.")
          }
          details={getErrorDetails(analysisQuery.error)}
          onAction={() => {
            void analysisQuery.refetch();
          }}
          title={isKorean ? "맞춤 분석을 불러올 수 없습니다" : "Unable to load tailored analysis"}
        />
      ) : analysisQuery.data ? (
        <div className="page-stack">
          <section className="page-card resume-tailor-workspace-surface">
            <div className="resume-tailor-workspace-surface__header">
              <div className="resume-tailor-workspace-surface__intro">
                <div className="resume-tailor-workspace-surface__eyebrow-row">
                  <span className="page-card__label">{isKorean ? "분석 작업공간" : "Analysis workspace"}</span>
                  <span className="question-status-badge question-status-badge--accent">{isKorean ? "4단계 중 4단계" : "Step 4 of 4"}</span>
                </div>
                <p className="resume-tailor-workspace-surface__breadcrumbs">
                  {isKorean ? "소스 이력서" : "Source resume"}
                  <span>/</span>
                  {isKorean ? "목표 직무" : "Target role"}
                  <span>/</span>
                  {isKorean ? "수락된 수정안" : "Accepted rewrite"}
                </p>
                <h2 className="resume-tailor-workspace-surface__title">{analysisQuery.data.matchSummary}</h2>
                <p className="resume-tailor-workspace-surface__body">
                  {isKorean ? "이 작업공간에서 어떤 제안이 목표 직무에 맞는 스토리를 실제로 강화하는지 결정하세요. 수락한 변경은 맞춤 미리보기와 내보내기 결과에만 반영되고 원본 소스 버전은 바뀌지 않습니다." : "Use this workspace to decide which suggestions actually harden the story for the target role. Accepted changes affect only the tailored preview and export outputs, never the original source version."}
                </p>
              </div>
              <div className="resume-tailor-workspace-surface__stats">
                <article className="resume-tailor-workspace-surface__stat">
                  <span>{isKorean ? "전체 점수" : "Overall score"}</span>
                  <strong>{analysisQuery.data.overallScoreLabel}</strong>
                </article>
                <article className="resume-tailor-workspace-surface__stat">
                  <span>{isKorean ? "제안" : "Suggestions"}</span>
                  <strong>{analysisQuery.data.suggestions.length}</strong>
                </article>
                <article className="resume-tailor-workspace-surface__stat">
                  <span>{isKorean ? "내보내기" : "Exports"}</span>
                  <strong>{(exportsQuery.data ?? analysisQuery.data.exports).length}</strong>
                </article>
              </div>
            </div>
            <div className="resume-tailor-workspace-surface__guidance" aria-label={isKorean ? "분석 상세 가이드" : "Analysis detail guidance"}>
              <article className="resume-tailor-workspace-surface__guidance-card">
                <span>{isKorean ? "수락 원칙" : "Accept rule"}</span>
                <strong>{isKorean ? "직무별 주장에 더 구체성을 주는 수정안만 수락하세요." : "Accept only the rewrites that make the role-specific claim more concrete."}</strong>
              </article>
              <article className="resume-tailor-workspace-surface__guidance-card">
                <span>{isKorean ? "미리보기 원칙" : "Preview rule"}</span>
                <strong>{isKorean ? "보존된 미리보기는 제안 메모가 아니라 최종 면접용 문서로 읽어야 합니다." : "Read the persisted preview as the final interview-facing document, not as suggestion notes."}</strong>
              </article>
              <article className="resume-tailor-workspace-surface__guidance-card">
                <span>{isKorean ? "내보내기 원칙" : "Export rule"}</span>
                <strong>{isKorean ? "수락한 경로가 원문보다 분명히 나아졌을 때만 PDF를 생성하세요." : "Generate PDF only after the accepted path clearly beats the original wording."}</strong>
              </article>
            </div>
            <div className="resume-tailor-workspace-surface__chips">
              <span className="detail-chip detail-chip--accent">{analysisQuery.data.statusLabel}</span>
              <span className="detail-chip">{analysisQuery.data.generationSourceLabel}</span>
              {analysisQuery.data.recommendedFormatType ? (
                <span className="detail-chip">{analysisQuery.data.recommendedFormatTypeLabel}</span>
              ) : null}
              <span className="detail-chip">{analysisQuery.data.createdAtLabel ?? (isKorean ? "생성 일시 없음" : "Created date unavailable")}</span>
            </div>
          </section>

          <div className="resume-tailor-workspace">
            <div className="resume-tailor-workspace__primary">
              <section className="page-card">
                <span className="page-card__label">{isKorean ? "매칭 인사이트" : "Match insights"}</span>
                <h2 className="page-card__title">{isKorean ? "강점과 누락 신호" : "Match gaps and strengths"}</h2>
                <div className="resume-tailor-card-grid">
                  <InsightListCard
                    items={analysisQuery.data.strongMatches}
                    title={isKorean ? "강한 매치" : "Strong matches"}
                  />
                  <InsightListCard
                    items={analysisQuery.data.missingKeywords}
                    title={isKorean ? "누락 키워드" : "Missing keywords"}
                    tone="warning"
                  />
                  <InsightListCard
                    items={analysisQuery.data.weakSignals}
                    title={isKorean ? "약한 신호" : "Weak signals"}
                    tone="warning"
                  />
                  <InsightListCard
                    items={analysisQuery.data.recommendedFocusAreas}
                    title={isKorean ? "권장 집중 영역" : "Recommended focus areas"}
                    tone="accent"
                  />
                </div>
                {analysisQuery.data.analysisNotes.length > 0 ? (
                  <div className="page-stack">
                    <h3 className="page-card__title">{isKorean ? "분석 메모" : "Analysis notes"}</h3>
                    <ul className="resume-tailor-list">
                      {analysisQuery.data.analysisNotes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>

              <section className="page-card">
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">{isKorean ? "제안" : "Suggestions"}</p>
                    <h2 className="page-card__title">{isKorean ? "섹션별 수정 제안" : "Section rewrite suggestions"}</h2>
                  </div>
                  <span className="section-heading__count">{analysisQuery.data.suggestions.length}</span>
                </div>
                {toggleSuggestionMutation.isError ? (
                  <ErrorStateCard
                    body={
                      userFacingErrorMessage(toggleSuggestionMutation.error, isKorean
                          ? "제안 수락 상태를 갱신하지 못했습니다."
                          : "The suggestion acceptance state could not be updated.")
                    }
                    details={getErrorDetails(toggleSuggestionMutation.error)}
                    onAction={() => toggleSuggestionMutation.reset()}
                    title={isKorean ? "제안을 갱신할 수 없습니다" : "Unable to update suggestion"}
                  />
                ) : null}
                {analysisQuery.data.suggestions.length === 0 ? (
                  <EmptyStateCard
                    body={
                      isKorean
                        ? "이 분석은 섹션 단위 수정 제안을 반환하지 않았습니다."
                        : "This analysis did not return any section-level rewrite suggestions."
                    }
                    title={isKorean ? "제안이 없습니다" : "No suggestions"}
                  />
                ) : (
                  <div className="stack-list">
                    {analysisQuery.data.suggestions.map((suggestion) => (
                      <article className="page-card page-card--muted" key={suggestion.id}>
                        <div className="section-heading">
                          <div>
                            <p className="section-heading__eyebrow">{suggestion.sectionLabel}</p>
                            <h3 className="page-card__title">{suggestion.suggestionTypeLabel}</h3>
                          </div>
                          <span
                            className={`question-status-badge ${
                              suggestion.accepted
                                ? "question-status-badge--positive"
                                : "question-status-badge--neutral"
                            }`}
                          >
                            {suggestion.accepted
                              ? isKorean
                                ? "수락됨"
                                : "Accepted"
                              : isKorean
                                ? "미수락"
                                : "Not accepted"}
                          </span>
                        </div>
                        {suggestion.originalText ? (
                          <div className="resume-tailor-compare-block">
                            <p className="resume-section__helper">{isKorean ? "원본 소스" : "Original source"}</p>
                            <p className="page-card__body resume-section__body--preserve">
                              {suggestion.originalText}
                            </p>
                          </div>
                        ) : null}
                        <div className="resume-tailor-compare-block">
                          <p className="resume-section__helper">{isKorean ? "제안된 수정안" : "Suggested rewrite"}</p>
                          <p className="page-card__body resume-section__body--preserve">
                            {suggestion.suggestedText}
                          </p>
                        </div>
                        <p className="resume-tailor-muted">{suggestion.reason}</p>
                        <div className="page-card__actions">
                          <button
                            className={suggestion.accepted ? "secondary-button" : "primary-button"}
                            disabled={toggleSuggestionMutation.isPending}
                            onClick={() => {
                              void toggleSuggestionMutation.mutateAsync({
                                suggestionId: suggestion.id,
                                accepted: !suggestion.accepted,
                              });
                            }}
                            type="button"
                          >
                            {suggestion.accepted
                              ? isKorean
                                ? "수락 해제"
                                : "Remove acceptance"
                              : isKorean
                                ? "제안 수락"
                                : "Accept suggestion"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="resume-tailor-workspace__preview">
              <section className="page-card">
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">{isKorean ? "미리보기" : "Preview"}</p>
                    <h2 className="page-card__title">{isKorean ? "저장된 맞춤 문서" : "Persisted tailored document"}</h2>
                  </div>
                  {analysisQuery.data.tailoredDocument?.formatType ? (
                    <span className="question-status-badge question-status-badge--neutral">
                      {analysisQuery.data.tailoredDocument.formatTypeLabel}
                    </span>
                  ) : null}
                </div>
                {analysisQuery.data.tailoredDocument ? (
                  <div className="resume-tailor-document">
                    <header className="resume-tailor-document__header">
                      <h3 className="page-card__title">{analysisQuery.data.tailoredDocument.title}</h3>
                      <div className="list-item-card__meta">
                        {analysisQuery.data.tailoredDocument.targetCompany ? (
                          <span>{analysisQuery.data.tailoredDocument.targetCompany}</span>
                        ) : null}
                        {analysisQuery.data.tailoredDocument.targetRole ? (
                          <span>{analysisQuery.data.tailoredDocument.targetRole}</span>
                        ) : null}
                      </div>
                    </header>
                    {analysisQuery.data.tailoredDocument.summary ? (
                      <p className="page-card__body resume-section__body--preserve">
                        {analysisQuery.data.tailoredDocument.summary}
                      </p>
                    ) : null}
                    {analysisQuery.data.tailoredDocument.diffSummary ? (
                      <div className="feedback-notice feedback-notice--info">
                        <p className="feedback-notice__message">
                          {analysisQuery.data.tailoredDocument.diffSummary}
                        </p>
                      </div>
                    ) : null}
                    {analysisQuery.data.tailoredDocument.analysisNotes.length > 0 ? (
                      <ul className="resume-tailor-list">
                        {analysisQuery.data.tailoredDocument.analysisNotes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="stack-list">
                      {analysisQuery.data.tailoredDocument.sections.map((section) => (
                        <article className="page-card page-card--muted" key={section.id}>
                          <p className="section-heading__eyebrow">{section.title}</p>
                          <div className="resume-tailor-section-lines">
                            {section.lines.map((line, index) => (
                              <p
                                className="page-card__body resume-section__body--preserve"
                                key={`${section.id}-${index}`}
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                    {analysisQuery.data.tailoredDocument.plainText ? (
                      <div className="page-card__actions">
                        <button
                          className="secondary-button"
                          onClick={() => {
                            void handleCopyPlainText();
                          }}
                          type="button"
                        >
                          {copiedPlainText
                            ? isKorean
                              ? "복사됨"
                              : "Copied"
                            : isKorean
                              ? "일반 텍스트 복사"
                              : "Copy plain text"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <EmptyStateCard
                    body={
                      isKorean
                        ? "백엔드가 아직 이 분석의 맞춤 미리보기 문서를 저장하지 않았습니다. 먼저 제안을 검토하세요."
                        : "The backend has not persisted a tailored preview document for this analysis yet. Review the suggestions first."
                    }
                    title={isKorean ? "아직 맞춤 미리보기가 없습니다" : "No tailored preview yet"}
                  />
                )}
              </section>
            </div>

            <div className="resume-tailor-workspace__aside">
              <section className="page-card">
                <span className="page-card__label">{isKorean ? "채용 공고" : "Job posting"}</span>
                <h2 className="page-card__title">{isKorean ? "저장된 목표 직무 컨텍스트" : "Saved target role context"}</h2>
                {analysisQuery.data.jobPostingId ? jobPostingDetailQuery.isLoading ? (
                  <LoadingStateCard
                    body={
                      isKorean
                        ? "이 분석에 연결된 저장된 채용 공고를 불러오는 중입니다."
                        : "Loading the saved job posting linked to this analysis."
                    }
                    title={isKorean ? "채용 공고 불러오는 중" : "Loading job posting"}
                  />
                ) : jobPostingDetailQuery.isError ? (
                  <ErrorStateCard
                    body={
                      userFacingErrorMessage(jobPostingDetailQuery.error, isKorean
                          ? "연결된 채용 공고를 불러오지 못했습니다."
                          : "The linked job posting could not be loaded.")
                    }
                    details={getErrorDetails(jobPostingDetailQuery.error)}
                    onAction={() => {
                      void jobPostingDetailQuery.refetch();
                    }}
                    title={isKorean ? "채용 공고를 불러올 수 없습니다" : "Unable to load job posting"}
                  />
                ) : jobPostingDetailQuery.data ? (
                  <>
                    <div className="list-item-card__meta">
                      <span>{jobPostingDetailQuery.data.inputTypeLabel}</span>
                      <span>{jobPostingDetailQuery.data.fetchStatusLabel}</span>
                    </div>
                    <p className="page-card__body">{jobPostingDetailQuery.data.title}</p>
                    {jobPostingDetailQuery.data.parsedSummary ? (
                      <p className="resume-tailor-muted">{jobPostingDetailQuery.data.parsedSummary}</p>
                    ) : null}
                    {jobPostingDetailQuery.data.parsedKeywords.length > 0 ? (
                      <div className="chip-list">
                        {jobPostingDetailQuery.data.parsedKeywords.slice(0, 10).map((keyword) => (
                          <span className="detail-chip detail-chip--accent" key={keyword}>
                            {keyword}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : null : (
                  <EmptyStateCard
                    body={
                      isKorean
                        ? "이 분석은 저장된 채용 공고 없이 생성되었습니다."
                        : "This analysis was created without a saved job posting."
                    }
                    title={isKorean ? "연결된 채용 공고가 없습니다" : "No linked job posting"}
                  />
                )}
              </section>

              <section className="page-card">
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">{isKorean ? "내보내기" : "Exports"}</p>
                    <h2 className="page-card__title">{isKorean ? "PDF 내보내기 기록" : "PDF export history"}</h2>
                  </div>
                  <span className="section-heading__count">
                    {(exportsQuery.data ?? analysisQuery.data.exports).length}
                  </span>
                </div>
                {createExportMutation.isError ? (
                  <ErrorStateCard
                    body={
                      userFacingErrorMessage(createExportMutation.error, isKorean
                          ? "PDF 내보내기를 만들지 못했습니다."
                          : "The PDF export could not be created.")
                    }
                    details={getErrorDetails(createExportMutation.error)}
                    onAction={() => createExportMutation.reset()}
                    title={isKorean ? "내보내기를 만들 수 없습니다" : "Unable to create export"}
                  />
                ) : null}
                <div className="page-card__actions">
                  <button
                    className="primary-button"
                    disabled={createExportMutation.isPending}
                    onClick={() => {
                      void createExportMutation.mutateAsync();
                    }}
                    type="button"
                  >
                    {createExportMutation.isPending
                      ? isKorean
                        ? "PDF 생성 중..."
                        : "Generating PDF..."
                      : isKorean
                        ? "PDF 내보내기 만들기"
                        : "Create PDF export"}
                  </button>
                </div>
                {exportsQuery.isLoading && analysisQuery.data.exports.length === 0 ? (
                  <LoadingStateCard
                    body={isKorean ? "이 분석의 내보내기 기록을 불러오는 중입니다." : "Loading export history for this analysis."}
                    title={isKorean ? "내보내기 불러오는 중" : "Loading exports"}
                  />
                ) : exportsQuery.isError && analysisQuery.data.exports.length === 0 ? (
                  <ErrorStateCard
                    body={
                      userFacingErrorMessage(exportsQuery.error, isKorean
                          ? "내보내기 기록을 불러오지 못했습니다."
                          : "Export history could not be loaded.")
                    }
                    details={getErrorDetails(exportsQuery.error)}
                    onAction={() => {
                      void exportsQuery.refetch();
                    }}
                    title={isKorean ? "내보내기 기록을 불러올 수 없습니다" : "Unable to load exports"}
                  />
                ) : (exportsQuery.data ?? analysisQuery.data.exports).length > 0 ? (
                  <div className="stack-list">
                    {(exportsQuery.data ?? analysisQuery.data.exports).map((exportItem) => (
                      <article className="list-item-card" key={exportItem.id}>
                        <div className="list-item-card__content">
                          <div className="list-item-card__meta">
                            <span>{exportItem.exportTypeLabel}</span>
                            {exportItem.formatType ? <span>{exportItem.formatTypeLabel}</span> : null}
                            {exportItem.createdAtLabel ? <span>{exportItem.createdAtLabel}</span> : null}
                          </div>
                          <h3 className="list-item-card__title">{exportItem.fileName}</h3>
                          <p className="resume-tailor-muted">
                            {exportItem.pageCount
                              ? isKorean
                                ? `${exportItem.pageCount}페이지`
                                : `${exportItem.pageCount} pages`
                              : isKorean
                                ? "페이지 수 없음"
                                : "Page count unavailable"}
                            {exportItem.fileSizeBytes ? ` · ${exportItem.fileSizeBytes} bytes` : ""}
                          </p>
                        </div>
                        <div className="list-item-card__actions">
                          <button
                            className="secondary-button"
                            onClick={() => {
                              void handleDownloadExport(exportItem.id, exportItem.fileName);
                            }}
                            type="button"
                          >
                            {isKorean ? "PDF 다운로드" : "Download PDF"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyStateCard
                    body={
                      isKorean
                        ? "아직 이 분석의 서버 측 PDF 내보내기 기록이 없습니다."
                        : "No server-side PDF exports exist for this analysis yet."
                    }
                    title={isKorean ? "아직 내보내기가 없습니다" : "No exports yet"}
                  />
                )}
              </section>

              <section className="page-card">
                <span className="page-card__label">{isKorean ? "원본 컨텍스트" : "Source context"}</span>
                <h2 className="page-card__title">{isKorean ? "원본 이력서 근거" : "Original resume evidence"}</h2>
                {snapshotsQuery.isLoading ? (
                  <LoadingStateCard
                    body={
                      isKorean
                        ? "원본 비교를 위한 파싱된 이력서 스냅샷을 불러오는 중입니다."
                        : "Loading parsed resume snapshots for source comparison."
                    }
                    title={isKorean ? "원본 이력서 불러오는 중" : "Loading source resume"}
                  />
                ) : snapshotsQuery.isError ? (
                  <ErrorStateCard
                    body={
                      userFacingErrorMessage(snapshotsQuery.error, isKorean
                          ? "이력서 원본 컨텍스트를 불러오지 못했습니다."
                          : "Resume source context could not be loaded.")
                    }
                    details={getErrorDetails(snapshotsQuery.error)}
                    onAction={() => {
                      void snapshotsQuery.refetch();
                    }}
                    title={isKorean ? "원본 컨텍스트를 불러올 수 없습니다" : "Unable to load source context"}
                  />
                ) : snapshotsQuery.data ? (
                  <div className="page-stack">
                    {snapshotsQuery.data.profile ? (
                      <ResumeProfileCard profile={snapshotsQuery.data.profile} />
                    ) : null}
                    <ResumeSkillsCard skills={snapshotsQuery.data.skills.slice(0, 8)} />
                    <ResumeExperienceTimeline experiences={snapshotsQuery.data.experiences} />
                    <ResumeProjectsCard projects={snapshotsQuery.data.projects} />
                  </div>
                ) : null}
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}

function InsightListCard({
  title,
  items,
  tone = "neutral",
}: {
  title: string;
  items: string[];
  tone?: "neutral" | "warning" | "accent";
}) {
  return (
    <article className="page-card page-card--muted">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Insight</p>
          <h3 className="page-card__title">{title}</h3>
        </div>
        <span className={`question-status-badge question-status-badge--${tone}`}>
          {items.length}
        </span>
      </div>
      {items.length > 0 ? (
        <ul className="resume-tailor-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="page-card__body">No items were returned for this section.</p>
      )}
    </article>
  );
}
