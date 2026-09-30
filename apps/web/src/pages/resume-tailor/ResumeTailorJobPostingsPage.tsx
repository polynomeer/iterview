import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCreateJobPostingMutation } from "../../features/resume-tailor/api/useCreateJobPostingMutation";
import { useJobPostingsQuery } from "../../features/resume-tailor/api/useJobPostingsQuery";
import { getErrorDetails, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { useLocale } from "../../shared/i18n";
import { useLayoutMode } from "../../shared/ui/layout";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";

type CompanyPriorityFilter = "all" | "high" | "medium" | "low";

function getPriorityTone(keywordCount: number) {
  if (keywordCount >= 8) {
    return { label: "high" as const, modifier: "high" as const };
  }

  if (keywordCount >= 4) {
    return { label: "medium" as const, modifier: "medium" as const };
  }

  return { label: "low" as const, modifier: "low" as const };
}

function getFitLabel(requirementCount: number) {
  if (requirementCount >= 6) {
    return "great" as const;
  }

  if (requirementCount >= 3) {
    return "good" as const;
  }

  return "fair" as const;
}

function getReadinessValue(keywordCount: number, responsibilityCount: number) {
  return Math.min(96, 48 + keywordCount * 4 + responsibilityCount * 3);
}

function getKeywordCount(jobPosting: {
  parsedKeywords?: string[];
}) {
  return jobPosting.parsedKeywords?.length ?? 0;
}

function getRequirementCount(jobPosting: {
  parsedRequirements?: string[];
}) {
  return jobPosting.parsedRequirements?.length ?? 0;
}

function getResponsibilityCount(jobPosting: {
  parsedResponsibilities?: string[];
}) {
  return jobPosting.parsedResponsibilities?.length ?? 0;
}

export function ResumeTailorJobPostingsPage() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const { isDesktop } = useLayoutMode();
  const [inputType, setInputType] = useState("text");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<CompanyPriorityFilter>("all");
  const [selectedPostingId, setSelectedPostingId] = useState("");
  const jobPostingsQuery = useJobPostingsQuery();
  const createMutation = useCreateJobPostingMutation();

  const jobPostings = jobPostingsQuery.data ?? [];

  useEffect(() => {
    if (!selectedPostingId && jobPostings[0]?.id) {
      setSelectedPostingId(jobPostings[0].id);
    }
  }, [jobPostings, selectedPostingId]);

  const filteredPostings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return jobPostings.filter((jobPosting) => {
      const haystack = [
        jobPosting.title,
        jobPosting.companyName,
        jobPosting.roleName,
        jobPosting.parsedSummary,
        jobPosting.parsedKeywords.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (normalizedSearch && !haystack.includes(normalizedSearch)) {
        return false;
      }

      if (priorityFilter === "all") {
        return true;
      }

      return getPriorityTone(getKeywordCount(jobPosting)).modifier === priorityFilter;
    });
  }, [jobPostings, priorityFilter, search]);

  const selectedPosting =
    filteredPostings.find((jobPosting) => jobPosting.id === selectedPostingId) ??
    jobPostings.find((jobPosting) => jobPosting.id === selectedPostingId) ??
    filteredPostings[0] ??
    jobPostings[0] ??
    null;

  const isCreateDisabled =
    createMutation.isPending ||
    (inputType === "link" ? !sourceUrl.trim() : !rawText.trim());

  async function handleCreate() {
    const created = await createMutation.mutateAsync({
      inputType,
      sourceUrl: sourceUrl.trim() || null,
      rawText: rawText.trim() || null,
      companyName: companyName.trim() || null,
      roleName: roleName.trim() || null,
    });

    setInputType("text");
    setSourceUrl("");
    setRawText("");
    setCompanyName(created.companyName ?? "");
    setRoleName(created.roleName ?? "");
    setSelectedPostingId(created.id);
  }

  const highPriorityCount = jobPostings.filter(
    (jobPosting) => getPriorityTone(getKeywordCount(jobPosting)).modifier === "high",
  ).length;
  const averageReadiness =
    jobPostings.length > 0
      ? Math.round(
          jobPostings.reduce(
            (sum, jobPosting) =>
              sum + getReadinessValue(getKeywordCount(jobPosting), getResponsibilityCount(jobPosting)),
            0,
          ) / jobPostings.length,
        )
      : 0;

  return (
    <PageContainer
      actions={
        <>
          <Link className="secondary-button" to={routeConfig.resumeTailor.buildPath()}>
            {isKorean ? "이력서 맞춤 허브" : "Resume tailor hub"}
          </Link>
          <Link className="secondary-button" to={routeConfig.resume.buildPath()}>
            {isKorean ? "이력서 분석 열기" : "Open resume analysis"}
          </Link>
        </>
      }
      description={
        isKorean
          ? "목표 회사와 저장된 채용 공고를 정리해 이력서 맞춤과 DFS 면접 드릴이 실제 채용 신호와 맞물리게 하세요."
          : "Curate target companies and saved job postings so resume tailoring and DFS interview drills stay aligned to real hiring signals."
      }
      eyebrow={isKorean ? "맞춤 흐름" : "Tailor flow"}
      title={isKorean ? "이력서를 다듬기 전에 회사 컨텍스트를 확보하세요" : "Capture the company context before tailoring the resume"}
    >
      <section className="page-card target-companies-workspace-surface">
        <div className="target-companies-workspace-surface__header">
          <div className="target-companies-workspace-surface__intro">
            <div className="target-companies-workspace-surface__eyebrow-row">
              <span className="page-card__label">{isKorean ? "목표 회사" : "Target companies"}</span>
              <span className="detail-chip">{isKorean ? "4단계 중 2단계" : "Step 2 of 4"}</span>
              <span className="question-status-badge question-status-badge--accent">{isKorean ? "회사 중심 준비" : "Company-aware prep"}</span>
            </div>
            <h2 className="target-companies-workspace-surface__title">{isKorean ? "다음 맞춤 이력서 수정을 이끌 직무 컨텍스트를 확보하세요" : "Capture the role context that should shape the next tailored resume pass"}</h2>
            <p className="target-companies-workspace-surface__body">
              {isKorean
                ? "우선순위를 비교하고 반복 테마를 파악하며, 각 회사를 일반적인 면접 준비가 아니라 구체적인 꼬리질문 압박과 연결할 수 있을 만큼 구조적으로 저장하세요."
                : "Save postings with enough structure to compare priorities, spot recurring themes, and keep each company tied to concrete follow-up pressure instead of generic interview prep."}
            </p>
          </div>
          <div className="target-companies-workspace-surface__stats">
            <article>
              <span>{isKorean ? "목표 회사" : "Target companies"}</span>
              <strong>{jobPostings.length}</strong>
            </article>
            <article>
              <span>{isKorean ? "높은 우선순위" : "High priority"}</span>
              <strong>{highPriorityCount}</strong>
            </article>
            <article>
              <span>{isKorean ? "평균 준비도" : "Avg. readiness"}</span>
              <strong>{`${averageReadiness}%`}</strong>
            </article>
          </div>
        </div>
      </section>

      <div className={`target-companies-layout ${isDesktop ? "target-companies-layout--desktop" : "target-companies-layout--mobile"}`}>
        <main className="target-companies-layout__main page-stack">
          <section className="page-card target-companies-create-card">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">{isKorean ? "목표 입력" : "Capture target"}</p>
                <h2 className="page-card__title">{isKorean ? "회사와 직무 컨텍스트 하나를 저장하세요" : "Save one company and role context"}</h2>
              </div>
            </div>

            <div aria-label={isKorean ? "입력 방식" : "Input type"} className="target-companies-create-card__mode-switch" role="tablist">
              {[
                { key: "text", label: isKorean ? "텍스트 붙여넣기" : "Paste text" },
                { key: "link", label: isKorean ? "링크 가져오기" : "Import link" },
              ].map((option) => (
                <button
                  aria-selected={inputType === option.key}
                  className={`target-companies-create-card__mode${inputType === option.key ? " target-companies-create-card__mode--active" : ""}`}
                  key={option.key}
                  onClick={() => {
                    setInputType(option.key);
                  }}
                  role="tab"
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="form-grid">
              <label className="form-field">
                <span className="form-field__label">{isKorean ? "입력 방식" : "Input type"}</span>
                <select
                  className="form-input"
                  onChange={(event) => setInputType(event.target.value)}
                  value={inputType}
                >
                  <option value="text">{isKorean ? "텍스트" : "Text"}</option>
                  <option value="link">{isKorean ? "링크" : "Link"}</option>
                </select>
              </label>
              <label className="form-field">
                <span className="form-field__label">{isKorean ? "회사" : "Company"}</span>
                <input
                  className="form-input"
                  onChange={(event) => setCompanyName(event.target.value)}
                  type="text"
                  value={companyName}
                />
              </label>
              <label className="form-field">
                <span className="form-field__label">{isKorean ? "직무" : "Role"}</span>
                <input
                  className="form-input"
                  onChange={(event) => setRoleName(event.target.value)}
                  type="text"
                  value={roleName}
                />
              </label>
              <label className="form-field form-field--full">
                <span className="form-field__label">{isKorean ? "원본 링크" : "Source link"}</span>
                <input
                  className="form-input"
                  onChange={(event) => setSourceUrl(event.target.value)}
                  placeholder="https://example.com/jobs/backend-platform-engineer"
                  type="url"
                  value={sourceUrl}
                />
                <span className="form-field__hint">
                  {isKorean
                    ? "링크 모드에서는 원문 텍스트가 선택 사항입니다. 백엔드가 원격 페이지에서 읽을 수 있는 내용을 가져오려고 시도합니다."
                    : "For link mode, raw text is optional. The backend will try to fetch readable content from the remote page."}
                </span>
              </label>
              <label className="form-field form-field--full">
                <span className="form-field__label">{isKorean ? "채용 공고 텍스트" : "Job posting text"}</span>
                <textarea
                  className="form-input form-input--textarea"
                  onChange={(event) => setRawText(event.target.value)}
                  placeholder={
                    isKorean
                      ? "이미 공고 텍스트가 있다면 여기에 붙여넣으세요."
                      : "Paste the job description if you already have the text."
                  }
                  rows={8}
                  value={rawText}
                />
                <span className="form-field__hint">
                  {isKorean ? "텍스트 모드에서는 필수이고, 링크 모드에서는 선택 사항입니다." : "Required for text mode. Optional for link mode."}
                </span>
              </label>
            </div>

            {createMutation.isError ? (
              <ErrorStateCard
                body={
                  userFacingErrorMessage(createMutation.error, isKorean
                      ? "채용 공고를 만들지 못했습니다."
                      : "The job posting could not be created.")
                }
                details={getErrorDetails(createMutation.error)}
                onAction={() => createMutation.reset()}
                title={isKorean ? "채용 공고를 저장할 수 없습니다" : "Unable to save job posting"}
              />
            ) : null}

            <div className="page-card__actions">
              <button
                className="primary-button"
                disabled={isCreateDisabled}
                onClick={() => {
                  void handleCreate();
                }}
                type="button"
              >
                {createMutation.isPending
                  ? isKorean
                    ? "저장 중..."
                    : "Saving..."
                  : isKorean
                    ? "채용 공고 저장"
                    : "Save job posting"}
              </button>
            </div>
          </section>

          <section className="page-card target-companies-board">
            <div className="target-companies-board__toolbar">
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">{isKorean ? "저장된 보드" : "Saved board"}</p>
                  <h2 className="page-card__title">{isKorean ? "추적 중인 회사" : "Tracked companies"}</h2>
                </div>
                <span className="section-heading__count">{jobPostings.length}</span>
              </div>

              <div className="target-companies-board__filters">
                <label className="target-companies-board__search">
                  <input
                    aria-label={isKorean ? "목표 회사 검색" : "Search target companies"}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={isKorean ? "회사, 직무, 키워드 검색" : "Search company, role, or keyword"}
                    type="search"
                    value={search}
                  />
                </label>
                <label className="target-companies-board__select">
                  <span>{isKorean ? "우선순위" : "Priority"}</span>
                  <select
                    aria-label={isKorean ? "우선순위 필터" : "Priority filter"}
                    onChange={(event) => setPriorityFilter(event.target.value as CompanyPriorityFilter)}
                    value={priorityFilter}
                  >
                    <option value="all">{isKorean ? "전체 우선순위" : "All priorities"}</option>
                    <option value="high">{isKorean ? "높은 우선순위" : "High priority"}</option>
                    <option value="medium">{isKorean ? "중간 우선순위" : "Medium priority"}</option>
                    <option value="low">{isKorean ? "낮은 우선순위" : "Low priority"}</option>
                  </select>
                </label>
              </div>
            </div>

            {jobPostingsQuery.isLoading ? (
              <LoadingStateCard
                body={isKorean ? "저장된 채용 공고와 수집 메타데이터를 불러오는 중입니다." : "Loading saved job postings and fetch metadata."}
                title={isKorean ? "채용 공고 불러오는 중" : "Loading job postings"}
              />
            ) : jobPostingsQuery.isError ? (
              <ErrorStateCard
                body={
                  userFacingErrorMessage(jobPostingsQuery.error, isKorean
                      ? "채용 공고를 불러오지 못했습니다."
                      : "Job postings could not be loaded.")
                }
                details={getErrorDetails(jobPostingsQuery.error)}
                onAction={() => {
                  void jobPostingsQuery.refetch();
                }}
                title={isKorean ? "채용 공고를 불러올 수 없습니다" : "Unable to load job postings"}
              />
            ) : (
              <div className="target-companies-board__list">
                {filteredPostings.map((jobPosting) => {
                  const priority = getPriorityTone(getKeywordCount(jobPosting));
                  const fitLabel = getFitLabel(getRequirementCount(jobPosting));
                  const readiness = getReadinessValue(getKeywordCount(jobPosting), getResponsibilityCount(jobPosting));

                  return (
                    <button
                      className={`target-company-card${jobPosting.id === selectedPosting?.id ? " target-company-card--active" : ""}`}
                      key={jobPosting.id}
                      onClick={() => {
                        setSelectedPostingId(jobPosting.id);
                      }}
                      type="button"
                    >
                      <div className="target-company-card__identity">
                        <div className="target-company-card__logo">
                          {(jobPosting.companyName ?? jobPosting.title).slice(0, 1).toUpperCase()}
                        </div>
                        <div className="target-company-card__title-block">
                          <div className="target-company-card__headline">
                            <strong>{jobPosting.companyName ?? (isKorean ? "저장된 회사" : "Saved company")}</strong>
                            <span className={`target-company-card__priority target-company-card__priority--${priority.modifier}`}>
                              {priority.label === "high"
                                ? isKorean
                                  ? "높은 우선순위"
                                  : "High priority"
                                : priority.label === "medium"
                                  ? isKorean
                                    ? "중간 우선순위"
                                    : "Medium priority"
                                  : isKorean
                                    ? "낮은 우선순위"
                                    : "Low priority"}
                            </span>
                          </div>
                          <div className="target-company-card__subline">
                            <span>{jobPosting.roleName ?? (isKorean ? "직무 미지정" : "Role not specified")}</span>
                            <span>{fitLabel === "great" ? (isKorean ? "매우 적합" : "Great fit") : fitLabel === "good" ? (isKorean ? "적합" : "Good fit") : isKorean ? "보통 적합" : "Fair fit"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="target-company-card__content">
                        <div className="target-company-card__section">
                          <span>{isKorean ? "집중 주제" : "Focus topics"}</span>
                          <div className="target-company-card__chips">
                            {(jobPosting.parsedKeywords ?? []).slice(0, 4).map((keyword) => (
                              <span className="detail-chip" key={keyword}>
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="target-company-card__section">
                          <span>{isKorean ? "반복 테마" : "Frequent themes"}</span>
                          <ul>
                            {((jobPosting.parsedResponsibilities ?? []).length > 0
                              ? jobPosting.parsedResponsibilities ?? []
                              : jobPosting.parsedRequirements ?? []
                            )
                              .slice(0, 3)
                              .map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                          </ul>
                        </div>
                        <div className="target-company-card__readiness">
                          <div className="target-company-card__readiness-ring">
                            <strong>{`${readiness}%`}</strong>
                          </div>
                          <span>{isKorean ? "준비도" : "Readiness"}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <aside className="target-companies-layout__rail page-stack">
          {selectedPosting ? (
            <section className="page-card target-company-detail-rail">
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">{isKorean ? "개요" : "Overview"}</p>
                  <h2 className="page-card__title">{selectedPosting.companyName ?? selectedPosting.title}</h2>
                </div>
              </div>

              <article className="target-company-detail-rail__hero">
                <div className="target-company-detail-rail__logo">
                  {(selectedPosting.companyName ?? selectedPosting.title).slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <strong>{selectedPosting.title}</strong>
                  <p>{selectedPosting.createdAtLabel}</p>
                </div>
              </article>

              <div className="target-company-detail-rail__panel">
                <div className="target-company-detail-rail__panel-header">
                  <span>{isKorean ? "나와의 적합도" : "Fit for you"}</span>
                  <strong>{getFitLabel(getRequirementCount(selectedPosting)) === "great" ? (isKorean ? "매우 적합" : "Great fit") : getFitLabel(getRequirementCount(selectedPosting)) === "good" ? (isKorean ? "적합" : "Good fit") : isKorean ? "보통 적합" : "Fair fit"}</strong>
                </div>
                <p>{selectedPosting.parsedSummary ?? (isKorean ? "아직 파싱된 요약이 없습니다." : "No parsed summary is available yet.")}</p>
              </div>

              <div className="target-company-detail-rail__panel">
                <div className="target-company-detail-rail__panel-header">
                  <span>{isKorean ? "주제별 준비도" : "Readiness by topic"}</span>
                  <strong>{`${getReadinessValue(getKeywordCount(selectedPosting), getResponsibilityCount(selectedPosting))}%`}</strong>
                </div>
                <div className="target-company-detail-rail__bars">
                  {(selectedPosting.parsedKeywords ?? []).slice(0, 5).map((keyword, index) => {
                    const value = Math.max(54, 92 - index * 7);
                    return (
                      <div className="target-company-detail-rail__bar-row" key={keyword}>
                        <span>{keyword}</span>
                        <div className="target-company-detail-rail__bar-track">
                          <div className="target-company-detail-rail__bar-fill" style={{ width: `${value}%` }} />
                        </div>
                        <strong>{`${value}%`}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="target-company-detail-rail__panel">
                <div className="target-company-detail-rail__panel-header">
                  <span>{isKorean ? "권장 다음 단계" : "Recommended next"}</span>
                </div>
                <div className="target-company-detail-rail__actions-list">
                  <Link className="target-company-detail-rail__action-card" to={routeConfig.resumeTailor.buildPath()}>
                    <div>
                      <strong>{isKorean ? "맞춤 시작" : "Start tailoring"}</strong>
                      <span>{isKorean ? "이 저장된 공고로 이력서 분석을 생성하세요." : "Generate a resume analysis from this saved posting."}</span>
                    </div>
                    <span>{isKorean ? "열기" : "Open"}</span>
                  </Link>
                  <Link className="target-company-detail-rail__action-card" to={routeConfig.practice.buildPath()}>
                    <div>
                      <strong>{isKorean ? "꼬리질문 연습" : "Practice follow-ups"}</strong>
                      <span>{isKorean ? "회사 컨텍스트에서 질문 드릴로 이동하세요." : "Move from company context into question drills."}</span>
                    </div>
                    <span>{isKorean ? "열기" : "Open"}</span>
                  </Link>
                </div>
              </div>

              {selectedPosting.fetchErrorMessage ? (
                <div className="target-company-detail-rail__panel">
                  <div className="target-company-detail-rail__panel-header">
                    <span>{isKorean ? "가져오기 메모" : "Fetch note"}</span>
                    <strong>{selectedPosting.fetchStatusLabel}</strong>
                  </div>
                  <p className="resume-tailor-muted">{selectedPosting.fetchErrorMessage}</p>
                </div>
              ) : null}
            </section>
          ) : null}
        </aside>
      </div>
    </PageContainer>
  );
}
